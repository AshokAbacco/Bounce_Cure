//verificationRoutes.js
import express from "express";
import AdvancedVerifier from "./advancedVerification.js";
import multer from "multer";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import pLimit from "p-limit";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const verifier = new AdvancedVerifier({
  dnsTimeout: 2000,
  smtpTimeout: 5000,
  retryGreylist: 1,
  cacheTtlMs: 30 * 60 * 1000,
  sgConcurrency: 200
});

const unlinkFile = promisify(fs.unlink);
const upload = multer({ dest: "uploads/" });

// Helper functions remain unchanged
function isExampleOrFakeEmail(email) { /* ... */ }
function firstEmailInObject(row) { /* ... */ }

// ------ Single verify ------
// ------ Single verify ------
// ------ Single verify ------



// ===================================================
// SINGLE EMAIL VERIFICATION
// ===================================================
router.post("/verify-single", async (req, res) => {
const { email } = req.body || {};
const userId = req.user?.id;




if (!userId) return res.status(401).json({ error: "Unauthorized" });
if (!email) return res.status(400).json({ error: "Email is required" });




try {
// ✅ Fetch user info
const user = await prisma.user.findUnique({
where: { id: userId },
select: { email: true, firstName: true, lastName: true, contactLimit: true },
});

// ✅ Find latest payment
let latest = await prisma.payment.findFirst({
  where: { userId },
  orderBy: { paymentDate: "desc" },
});

// ✅ Auto-create free trial payment if none exists
if (!latest) {
  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Free Trial User";

  latest = await prisma.payment.create({
    data: {
      userId,
      email: user?.email || "unknown@example.com",
      name: fullName,
      emailVerificationCredits: 50,
      emailSendCredits: 0,
      transactionId: `FREE-${Date.now()}`,
      planName: "Free Trial",
      planType: "Trial",
      provider: "System",
      amount: 0,
      currency: "USD",
      planPrice: 0,
      discount: 0,
      paymentMethod: "System",
      cardLast4: null,
      billingAddress: null,
      paymentDate: new Date(),
      nextPaymentDate: null,
      status: "active",
      notified: false,
    },
  });
  console.log(`🆕 Created free trial payment record for user ${userId}`);
}

// ✅ Combine user + payment credits
let credits = Math.max(
  latest?.emailVerificationCredits ?? 0,
  user?.contactLimit ?? 0
);

if (credits < 1) {
  return res.status(403).json({
    error: "You’ve used all your verification credits. Please purchase more credits.",
  });
}

// ✅ Deduct 1 credit from both user & payment
const remaining = Math.max(credits - 1, 0);
await prisma.payment.update({
  where: { id: latest.id },
  data: { emailVerificationCredits: remaining },
});
await prisma.user.update({
  where: { id: userId },
  data: { contactLimit: remaining },
});

// ✅ Verify email
const result = await verifier.verify(email, { smtpCheck: true });

// ✅ Save verification result
await prisma.verification.upsert({
  where: { userId_email: { userId, email: result.email } },
  update: result,
  create: { ...result, userId },
});

res.json(result);




} catch (err) {
console.error("verify-single error:", err);
res.status(500).json({ error: "Verification error", details: err.message });
}
});




// ===================================================
// BULK VERIFICATION
// ===================================================
router.post("/verify-bulk", async (req, res) => {
const { emails } = req.body || {};
const userId = req.user?.id;




if (!userId) return res.status(401).json({ error: "Unauthorized" });
if (!emails?.length) return res.status(400).json({ error: "Emails are required" });




try {
const user = await prisma.user.findUnique({
where: { id: userId },
select: { contactLimit: true },
});
const latest = await prisma.payment.findFirst({
where: { userId },
orderBy: { paymentDate: "desc" },
});

// ✅ Combine credits
let credits = Math.max(
  latest?.emailVerificationCredits ?? 0,
  user?.contactLimit ?? 0
);

if (credits < emails.length) {
  return res.status(403).json({
    error: "Not enough verification credits. Please purchase more credits.",
  });
}

// ✅ Deduct used credits
const remaining = Math.max(credits - emails.length, 0);
if (latest) {
  await prisma.payment.update({
    where: { id: latest.id },
    data: { emailVerificationCredits: remaining },
  });
}
await prisma.user.update({
  where: { id: userId },
  data: { contactLimit: remaining },
});

// ✅ Process verification
const results = [];
for (const email of emails) {
  const r = await verifier.verify(email, { smtpCheck: true });
  results.push(r);
}

// ✅ Count valid, invalid, risky (required fields on VerificationBatch)
const validCount = results.filter((r) => r.status === "valid").length;
const invalidCount = results.filter((r) => r.status === "invalid").length;
const riskyCount = results.filter((r) => r.status === "risky").length;

// ✅ Save batch (BatchResult.mx is a String column, so join the array)
const batch = await prisma.verificationBatch.create({
  data: {
    source: "bulk",
    userId,
    total: results.length,
    validCount,
    invalidCount,
    riskyCount,
    includeOnlyValid: false,
    results: {
      create: results.map((r) => ({
        ...r,
        userId,
        mx: Array.isArray(r.mx) ? r.mx.join(", ") : r.mx ?? null,
      })),
    },
  },
});

res.json({
  success: true,
  batchId: batch.id,
  results,
  summary: { total: results.length, validCount, invalidCount, riskyCount },
});




} catch (err) {
console.error("verify-bulk error:", err);
res.status(500).json({ error: "Bulk verification failed", details: err.message });
}
});




// ===================================================
// MANUAL VERIFY (Paste multiple emails)
// ===================================================
router.post("/verify-manual", async (req, res) => {
const { text } = req.body || {};
const userId = req.user?.id;




if (!userId) return res.status(401).json({ error: "Unauthorized" });
if (!text) return res.status(400).json({ error: "Text is required" });




const emails = text.split(/\s|,|;/).filter((e) => e.includes("@"));




try {
const user = await prisma.user.findUnique({
where: { id: userId },
select: { email: true, firstName: true, lastName: true, contactLimit: true },
});
let latest = await prisma.payment.findFirst({
where: { userId },
orderBy: { paymentDate: "desc" },
});

// ✅ Auto-create free trial if missing
if (!latest) {
  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Free Trial User";

  latest = await prisma.payment.create({
    data: {
      userId,
      email: user?.email || "unknown@example.com",
      name: fullName,
      emailVerificationCredits: 50,
      emailSendCredits: 0,
      transactionId: `FREE-${Date.now()}`,
      planName: "Free Trial",
      planType: "Trial",
      provider: "System",
      amount: 0,
      currency: "USD",
      planPrice: 0,
      discount: 0,
      paymentMethod: "System",
      paymentDate: new Date(),
      status: "active",
    },
  });
  console.log(`🆕 Created free trial payment record for user ${userId}`);
}

// ✅ Combine user + payment credits
let credits = Math.max(
  latest.emailVerificationCredits ?? 0,
  user?.contactLimit ?? 0
);

if (credits < emails.length) {
  return res.status(403).json({
    error: "Not enough verification credits. Please purchase more credits.",
  });
}

// ✅ Deduct used credits
const remaining = Math.max(credits - emails.length, 0);
await prisma.payment.update({
  where: { id: latest.id },
  data: { emailVerificationCredits: remaining },
});
await prisma.user.update({
  where: { id: userId },
  data: { contactLimit: remaining },
});

// ✅ Process verification
const results = [];
for (const e of emails) {
  const r = await verifier.verify(e, { smtpCheck: true });
  results.push(r);
}

// ✅ Count valid, invalid, risky
const validCount = results.filter((r) => r.status === "valid").length;
const invalidCount = results.filter((r) => r.status === "invalid").length;
const riskyCount = results.filter((r) => r.status === "risky").length;

// ✅ Save batch (convert mx to string)
const batch = await prisma.verificationBatch.create({
  data: {
    source: "manual",
    userId,
    total: results.length,
    validCount,
    invalidCount,
    riskyCount,
    includeOnlyValid: false,
    results: {
      create: results.map((r) => ({
        ...r,
        userId,
        mx: Array.isArray(r.mx) ? r.mx.join(", ") : r.mx ?? null,
      })),
    },
  },
});

res.json({
  success: true,
  batchId: batch.id,
  results,
  summary: { total: results.length, validCount, invalidCount, riskyCount },
});




} catch (err) {
console.error("verify-manual error:", err);
res.status(500).json({
error: "Manual verification failed",
details: err.message,
});
}
});



// Get recent batches
router.get("/batches", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { source } = req.query;

  const where = source ? { source, userId } : { userId };

  try {
    const batches = await prisma.verificationBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { results: false } // or true, depending on your UI
    });
    return res.json({ batches });
  } catch (err) {
    console.error("[/batches] ERROR", err);
    return res.status(500).json({ error: "Failed to load batches" });
  }
});


// Get results for a specific batch
router.get("/batches/:id/results", async (req, res) => {
  const userId = req.user?.id;
  const batchId = parseInt(req.params.id, 10);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // ✅ First, check that batch belongs to the current user
    const batch = await prisma.verificationBatch.findFirst({
      where: { id: batchId, userId },
    });

    if (!batch) {
      return res.status(403).json({ error: "You do not have access to this batch" });
    }

    const results = await prisma.batchResult.findMany({
      where: { batchId },
      orderBy: { createdAt: "asc" }
    });

    return res.json({ results });
  } catch (err) {
    console.error("[/batches/:id/results] ERROR", err);
    return res.status(500).json({ error: "Failed to load results" });
  }
});


// Delete a batch (and its results, via onDelete: Cascade)
router.delete("/batches/:id", async (req, res) => {
  const userId = req.user?.id;
  const batchId = parseInt(req.params.id, 10);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (Number.isNaN(batchId)) return res.status(400).json({ error: "Invalid batch id" });

  try {
    // Only delete batches that belong to the current user
    const { count } = await prisma.verificationBatch.deleteMany({
      where: { id: batchId, userId },
    });

    if (count === 0) {
      return res.status(404).json({ error: "Batch not found" });
    }

    return res.json({ success: true, id: batchId });
  } catch (err) {
    console.error("[DELETE /batches/:id] ERROR", err);
    return res.status(500).json({ error: "Failed to delete batch" });
  }
});


export default router;