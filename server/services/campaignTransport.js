// server/services/campaignTransport.js
// ================================================================
// ✉️ CAMPAIGN SENDING METHOD: SendGrid or SMTP
// ----------------------------------------------------------------
// • USER role  → SendGrid only (unchanged behaviour).
// • ADMIN role → may choose SendGrid or SMTP in the From step.
// The method is stored on Campaign.sendMethod and every send path
// (immediate batches, restart-resume, scheduled cron, scheduler)
// calls sendCampaignMessage() with it, so one campaign never mixes
// providers.
//
// SMTP credentials come ONLY from the server .env:
//   SMTP_HOST / EMAIL_HOST      e.g. smtp.gmail.com
//   SMTP_PORT / EMAIL_PORT      587 (STARTTLS) or 465 (SSL)
//   SMTP_SECURE / EMAIL_SECURE  "true" for 465 (auto from port if unset)
//   SMTP_USER / EMAIL_USER      login
//   SMTP_PASS / EMAIL_PASS      password / Gmail app password
//   SMTP_FROM_EMAIL             optional; defaults to the login (Gmail rewrites other From addresses)
//   SMTP_DAILY_LIMIT            optional; default 450 (personal Gmail ≈ 500 recipients / 24h)
// SMTP_* wins over EMAIL_*, so you can move campaigns to another SMTP
// provider without affecting other app mail that uses EMAIL_*.
// ================================================================
import nodemailer from "nodemailer";
import { prisma } from "../prisma/prismaClient.js";

export const SEND_METHODS = ["SENDGRID", "SMTP"];

/* ── role helpers ─────────────────────────────────────────── */
export const isAdminUser = (user) => String(user?.role || "").toUpperCase() === "ADMIN";

export function allowedMethodsFor(user) {
  return isAdminUser(user) ? ["SENDGRID", "SMTP"] : ["SENDGRID"];
}

// Returns the method to use, or throws { status: 403 } if the user may not use it.
export function resolveSendMethod(requested, user) {
  const method = String(requested || "SENDGRID").trim().toUpperCase();
  if (!SEND_METHODS.includes(method)) {
    const e = new Error(`Invalid sending method "${requested}". Use SENDGRID or SMTP.`);
    e.status = 400;
    throw e;
  }
  if (!allowedMethodsFor(user).includes(method)) {
    const e = new Error("Only admin users can send campaigns via SMTP.");
    e.status = 403;
    throw e;
  }
  return method;
}

/* ── SMTP config ──────────────────────────────────────────── */
const truthy = (v) => ["1", "true", "yes", "on"].includes(String(v ?? "").trim().toLowerCase());

export function getSmtpSettings(env = process.env) {
  const host   = (env.SMTP_HOST || env.EMAIL_HOST || "").trim();
  const port   = Number(env.SMTP_PORT || env.EMAIL_PORT || 587);
  const secureRaw = env.SMTP_SECURE ?? env.EMAIL_SECURE;
  const secure = secureRaw === undefined || secureRaw === "" ? port === 465 : truthy(secureRaw);
  const user   = (env.SMTP_USER || env.EMAIL_USER || "").trim();
  let   pass   = env.SMTP_PASS || env.EMAIL_PASS || "";
  const isGmail = /(^|\.)(gmail|googlemail)\.com$/i.test(host);
  if (isGmail) pass = pass.replace(/\s+/g, ""); // Gmail shows app passwords as "abcd efgh ijkl mnop"
  const limit = Number(env.SMTP_DAILY_LIMIT);
  return {
    host, port, secure, user, pass, isGmail,
    fromEmail:  (env.SMTP_FROM_EMAIL || user).trim(),
    dailyLimit: Number.isFinite(limit) && limit > 0 ? limit : 450,
    configured: Boolean(host && port && user && pass),
  };
}

let transporterCache = { key: null, t: null };
function getTransporter(cfg) {
  const key = [cfg.host, cfg.port, cfg.secure, cfg.user, cfg.pass].join("|");
  if (transporterCache.key !== key) {
    transporterCache.t?.close?.();
    transporterCache = {
      key,
      t: nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,          // true = SSL (465), false = STARTTLS (587)
        requireTLS: !cfg.secure,     // never send credentials unencrypted
        auth: { user: cfg.user, pass: cfg.pass },
        pool: true,
        maxConnections: 1,
        maxMessages: 100,
        connectionTimeout: 20_000,
        greetingTimeout: 15_000,
        socketTimeout: 60_000,
        tls: { minVersion: "TLSv1.2" },
      }),
    };
  }
  return transporterCache.t;
}

/* ── SMTP daily usage (UTC day) ──────────────────────────── */
const today = () => new Date().toISOString().slice(0, 10);

export async function getSmtpUsage() {
  const { dailyLimit } = getSmtpSettings();
  const row = await prisma.smtpDailyUsage.findUnique({ where: { day: today() } });
  const usedToday = row?.count || 0;
  return { dailyLimit, usedToday, remaining: Math.max(0, dailyLimit - usedToday) };
}

async function reserveSmtpSlot(dailyLimit) {
  const row = await prisma.smtpDailyUsage.upsert({
    where:  { day: today() },
    create: { day: today(), count: 1 },
    update: { count: { increment: 1 } },
  });
  if (row.count > dailyLimit) {
    await releaseSmtpSlot();
    const e = new Error(`SMTP daily limit reached (${dailyLimit} emails/day). Try again tomorrow or use SendGrid.`);
    e.stopCampaign = true;
    e.code = "SMTP_DAILY_LIMIT";
    throw e;
  }
}

async function releaseSmtpSlot() {
  await prisma.smtpDailyUsage
    .update({ where: { day: today() }, data: { count: { decrement: 1 } } })
    .catch(() => {});
}

// Errors that mean "stop the whole campaign" (login/quota/rate limit), not "this address is bad".
export function isSmtpStopError(err) {
  if (err?.stopCampaign) return true;
  if (err?.code === "EAUTH" || err?.code === "ECONNECTION" || err?.code === "ETIMEDOUT") return true;
  const code = Number(err?.responseCode);
  if ([421, 450, 451, 452, 454].includes(code)) return true;
  return /5\.4\.5|daily user sending|quota|rate limit|too many/i.test(`${err?.response || ""} ${err?.message || ""}`);
}

/* ── info for the From step ──────────────────────────────── */
export async function getSendMethodsFor(user) {
  const sendgridConfigured = Boolean(process.env.SENDGRID_CAMPAIGN_API_KEY || process.env.SENDGRID_API_KEY);
  const methods = [{
    id: "SENDGRID",
    label: "SendGrid",
    configured: sendgridConfigured,
    provider: "SendGrid",
    fromEmailEditable: true,          // user enters a verified sender
    requiresVerifiedSender: true,
  }];

  if (isAdminUser(user)) {
    const cfg = getSmtpSettings();
    let usage = { dailyLimit: cfg.dailyLimit, usedToday: 0, remaining: cfg.dailyLimit };
    try { usage = await getSmtpUsage(); } catch { /* table missing until migration */ }
    methods.push({
      id: "SMTP",
      label: "SMTP",
      configured: cfg.configured,
      provider: cfg.isGmail ? "Gmail SMTP" : cfg.host || "SMTP",
      host: cfg.host,
      port: cfg.port,
      encryption: cfg.secure ? "SSL/TLS" : "STARTTLS",
      fromEmail: cfg.fromEmail,       // the account mail is sent from (no password ever returned)
      fromEmailEditable: false,
      requiresVerifiedSender: false,
      ...usage,
    });
  }

  return {
    role: isAdminUser(user) ? "ADMIN" : "USER",
    isAdmin: isAdminUser(user),
    defaultMethod: "SENDGRID",
    methods,
  };
}

/* ── the one send function every campaign path uses ─────── */
// `msg` is the SendGrid-style message the existing code already builds.
// `sendgridSend` is that file's existing dedicated SendGrid sender.
// Returns a SendGrid-shaped response so existing `response[0].statusCode`
// checks keep working for both methods.
export async function sendCampaignMessage(method, msg, sendgridSend) {
  if (String(method || "SENDGRID").toUpperCase() !== "SMTP") {
    return sendgridSend(msg);
  }

  const cfg = getSmtpSettings();
  if (!cfg.configured) {
    const e = new Error("SMTP is not configured on the server (EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS).");
    e.stopCampaign = true;
    throw e;
  }

  await reserveSmtpSlot(cfg.dailyLimit);

  const fromName  = typeof msg.from === "object" ? msg.from.name : undefined;
  const typedFrom = typeof msg.from === "object" ? msg.from.email : msg.from;
  const replyTo   = msg.replyTo || (typedFrom && typedFrom !== cfg.fromEmail ? typedFrom : undefined);
  const campaignId = msg.customArgs?.campaignId;

  try {
    const info = await getTransporter(cfg).sendMail({
      from: { name: fromName || "", address: cfg.fromEmail },
      to: msg.to,
      replyTo,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      headers: {
        ...(campaignId ? { "X-Campaign-Id": String(campaignId) } : {}),
        "List-Unsubscribe": `<mailto:${replyTo || cfg.fromEmail}?subject=unsubscribe>`,
      },
    });
    if (info.rejected?.length) {
      const e = new Error(`Recipient rejected: ${info.rejected.join(", ")}`);
      e.responseCode = 550;
      throw e;
    }
    return [{ statusCode: 202, headers: { "x-message-id": info.messageId || null } }];
  } catch (err) {
    await releaseSmtpSlot();
    if (isSmtpStopError(err)) err.stopCampaign = true;
    if (err.code === "EAUTH") {
      err.message = "SMTP login failed. Check EMAIL_USER / EMAIL_PASS (Gmail needs a 16-character app password).";
    }
    throw err;
  }
}