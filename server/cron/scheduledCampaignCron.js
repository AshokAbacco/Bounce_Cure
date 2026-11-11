// server/cron/scheduledCampaignCron.js
import cron from "node-cron";
import sgMail from "@sendgrid/mail";
import { prisma } from "../prisma/prismaClient.js";
import { sendCampaignMessage } from "../services/campaignTransport.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* ==========================================================
   🎨 HTML GENERATOR - SAME AS IMMEDIATE SEND
========================================================== */
const generateHtmlFromCanvas = (canvasData, subject, fromName, fromEmail,fromAddress) => {
  // Empty template
  if (!canvasData || canvasData.length === 0) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="padding:20px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
            <tr><td style="padding:20px;background-color:#ffffff;">
              <h1 style="margin:0 0 20px 0;font-size:24px;color:#333;">${subject}</h1>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333;">
                This email was sent from your campaign builder.
              </p>
              <hr style="border:none;height:1px;background:#eee;margin:30px 0;">
              <div style="margin:0;padding:0;text-align:center;">
                <p style="margin:0;font-size:12px;color:#999;">Sent by ${fromName}</p>
                <p style="margin:5px 0;font-size:12px;color:#999;">
                  Gal Electronics · 151 14th St NW #2143 · Atlanta, GA 30318-7835 · USA
                </p>
                <p style="margin:0;font-size:12px;color:#999;">
                  <a href="mailto:${fromEmail}" style="color:#007bff;">${fromEmail}</a>
                </p>
              </div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
  }

  // Normalize Y values
  const normalized = canvasData.map((e) => ({
    ...e,
    y: Number(e.y) || 0,
    x: Number(e.x) || 0
  }));

  // Sort by Y position
  const sorted = normalized.sort((a, b) => a.y - b.y);

  // Group into rows
  function groupRows(elements, threshold = 15) {
    let rows = [];
    const sortedElements = [...elements].sort((a, b) => {
      if (Math.abs(a.y - b.y) > 10) return a.y - b.y;
      return a.x - b.x;
    });

    sortedElements.forEach(el => {
      const elMidpoint = el.y + ((el.height || 80) / 2);
      let added = false;

      for (let row of rows) {
        const rowMidpoint = (row[0].y + ((row[0].height || 80) / 2));
        if (Math.abs(elMidpoint - rowMidpoint) <= threshold) {
          row.push(el);
          added = true;
          break;
        }
      }

      if (!added) rows.push([el]);
    });

    rows.forEach(row => row.sort((a, b) => a.x - b.x));
    return rows;
  }

  const rows = groupRows(sorted);

  // Render element function
  function renderElement(el) {
    switch (el.type) {
      case "heading":
        return `
          <h1 style="
            margin:0 0 20px;
            font-size:${el.fontSize || 28}px;
            color:${el.color || "#333"};
            background:${el.backgroundColor || "transparent"};
            font-weight:bold;
            text-align:${el.textAlign || "left"};
            line-height:1.3;
          ">${el.content || "Heading"}</h1>
        `;

      case "subheading":
        return `
          <h2 style="
            margin:0 0 16px;
            font-size:${el.fontSize || 22}px;
            color:${el.color || "#333"};
            background:${el.backgroundColor || "transparent"};
            font-weight:600;
            text-align:${el.textAlign || "left"};
          ">${el.content || "Subheading"}</h2>
        `;

      case "paragraph":
        return `
          <div style="
            font-size:${el.fontSize || 16}px;
            color:${el.color || "#333"};
            background:${el.backgroundColor || "transparent"};
            line-height:1.6;
            text-align:${el.textAlign || "left"};
            margin:0 0 16px;
            word-break:break-word;
          ">
            ${el.content || ""}
          </div>
        `;

      case "image":
        return `
          <img src="${el.src}" 
            style="
              width:100%;
              max-width:${el.width || 250}px;
              border-radius:${el.borderRadius || 0}px;
              display:block;
              margin:0 auto;
            " 
          />
        `;

      case "button":
        return `
          <table cellpadding="0" cellspacing="0" border="0" style="margin:15px auto;">
            <tr>
              <td style="
                background:${el.backgroundColor || "#007bff"};
                padding:12px 20px;
                border-radius:6px;
                text-align:center;
              ">
                <a 
                  href="${
                    el.email
                      ? (el.email.startsWith("mailto:") ? el.email : "mailto:" + el.email)
                      : (el.link || "#")
                  }"
                  style="
                    color:${el.color || "#fff"};
                    font-size:${el.fontSize || 16}px;
                    text-decoration:none;
                    font-weight:bold;
                  "
                >
                  ${el.content || "Click Me"}
                </a>
              </td>
            </tr>
          </table>
        `;

      case "line":
        return `
          <hr style="
            height:${el.strokeWidth || 1}px;
            background:${el.strokeColor || "#ccc"};
            border:none;
            margin:20px 0;
          "/>
        `;

      default:
        return "";
    }
  }

  // Build HTML
  let htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="padding:20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;max-width:600px;">
          <tr><td style="padding:30px;">`;

  // Render rows
  rows.forEach(row => {
    if (row.length > 1) {
      const colWidth = Math.floor(100 / row.length);
      htmlContent += `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`;
      row.forEach(el => {
        htmlContent += `
          <td width="${colWidth}%" valign="top" style="padding:10px;">
            ${renderElement(el)}
          </td>
        `;
      });
      htmlContent += `</tr></table>`;
    } else {
      htmlContent += renderElement(row[0]);
    }
  });

  // Footer
  htmlContent += `
          </td></tr>
          <tr>
            <td style="padding:20px;background:#f8f9fa;border-top:1px solid #ddd;text-align:center;">
              <p style="margin:0 0 5px;font-size:12px;color:#777;">
                Sent by <strong>${fromName}</strong>
              </p>
              <p style="margin:5px 0;font-size:12px;color:#777;">
                ${fromAddress}
              </p>
              <p style="margin:0;font-size:12px;color:#777;">
                <a href="mailto:${fromEmail}" style="color:#007bff;">${fromEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;

  return htmlContent;
};

const generatePlainTextFromCanvas = (canvasData, subject, fromName, fromEmail) => {
  let plainText = `${subject}\n\n`;
  if (!canvasData || canvasData.length === 0) {
    plainText += "This email was sent from your campaign builder.\n\n";
  } else {
    canvasData.forEach((el) => {
      switch (el.type) {
        case "heading":
        case "subheading":
        case "paragraph":
          plainText += `${el.content || ""}\n\n`;
          break;
        case "image":
          plainText += `[Image: ${el.alt || "Image"}]\n\n`;
          break;
        case "button":
          plainText += `[${el.content || "Button"}] - ${el.link || "#"}\n\n`;
          break;
        case "line":
          plainText += "----------------------------------------\n\n";
          break;
      }
    });
  }
  plainText += `\n\nSent by ${fromName}\nEmail: ${fromEmail}`;
  return plainText;
};

/* ==========================================================
   📅 PROCESS SCHEDULED CAMPAIGNS
========================================================== */
async function processScheduledCampaigns() {
  try {
    const now = new Date();
    console.log(`\n⏰ Checking for scheduled campaigns at ${now.toISOString()}`);

    // Find campaigns due to be sent (within last 2 minutes to current time)
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    const dueCampaigns = await prisma.campaign.findMany({
      where: {
        scheduleType: "scheduled",
        status: "scheduled",
        scheduledAt: {
          gte: twoMinutesAgo,
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailLimit: true,
          },
        },
      },
    });

    console.log(`📋 Found ${dueCampaigns.length} campaigns to process`);

    for (const campaign of dueCampaigns) {
      try {
        console.log(`\n📤 Processing campaign: ${campaign.name} (ID: ${campaign.id})`);

        // Parse recipients and canvas data
        let recipients = [];
        let canvasData = [];

        try {
          recipients = JSON.parse(campaign.recipientsJson || "[]");
          canvasData = JSON.parse(campaign.designJson || "[]");
        } catch (parseError) {
          console.error(`❌ Failed to parse campaign data:`, parseError);
          throw new Error("Invalid campaign data format");
        }

        if (recipients.length === 0) {
          throw new Error("No recipients found");
        }

        // Update campaign status to processing
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: "processing" },
        });

        // Check credits
        const payments = await prisma.payment.findMany({
          where: { userId: campaign.userId, status: "succeeded" },
          select: { id: true, emailSendCredits: true },
        });

        const totalPaymentCredits = payments.reduce((sum, p) => sum + (p.emailSendCredits || 0), 0);
        const availableCredits = (campaign.user.emailLimit || 0) + totalPaymentCredits;

        if (availableCredits < recipients.length) {
          throw new Error(`Insufficient credits: need ${recipients.length}, have ${availableCredits}`);
        }

        // Generate HTML and plain text
        const htmlContent = generateHtmlFromCanvas(
          canvasData,
          campaign.subject,
          campaign.fromName,
          campaign.fromEmail,
          campaign.fromAddress
        );

        const plainTextContent = generatePlainTextFromCanvas(
          canvasData,
          campaign.subject,
          campaign.fromName,
          campaign.fromEmail
        );

        // Send emails
        const results = { success: [], failed: [] };
        let actualSentCount = 0;
        let stopReason = null;

        for (const recipient of recipients) {
          const toEmail = typeof recipient === "string" ? recipient : recipient.email;
          if (!toEmail) continue;

          if (stopReason) {
            results.failed.push({ email: toEmail, error: stopReason });
            continue;
          }
          if (actualSentCount >= availableCredits) {
            results.failed.push({ email: toEmail, error: "Credit limit reached" });
            break;
          }

          const msg = {
            to: toEmail,
            from: { name: campaign.fromName, email: campaign.fromEmail },
            subject: campaign.subject,
            text: plainTextContent,
            html: htmlContent,
          };

          try {
            // ✉️ Uses the method chosen in the From step (SENDGRID or SMTP)
            const response = await sendCampaignMessage(campaign.sendMethod, msg, (m) => sgMail.send(m));
            if (response[0].statusCode >= 200 && response[0].statusCode < 300) {
              results.success.push({ email: toEmail });
              actualSentCount++;
            } else {
              results.failed.push({ 
                email: toEmail, 
                error: `SendGrid status ${response[0].statusCode}` 
              });
            }
          } catch (err) {
            const msgErr = err.response?.body?.errors?.[0]?.message || err.message;
            console.error(`❌ Failed to send to ${toEmail}:`, msgErr);
            if (err.stopCampaign) stopReason = msgErr; // quota / login: stop hitting the provider
            results.failed.push({ email: toEmail, error: msgErr });
          }

          // Rate limiting
          await new Promise((r) => setTimeout(r, 200));
        }

        // Deduct credits
        let remainingToDeduct = actualSentCount;

        const succeededPayments = await prisma.payment.findMany({
          where: { userId: campaign.userId, status: "succeeded" },
          orderBy: { paymentDate: "asc" },
          select: { id: true, emailSendCredits: true },
        });

        for (const p of succeededPayments) {
          if (remainingToDeduct <= 0) break;
          const current = p.emailSendCredits || 0;
          const deduct = Math.min(current, remainingToDeduct);
          const newCredit = Math.max(0, current - deduct);

          await prisma.payment.update({
            where: { id: p.id },
            data: { emailSendCredits: newCredit },
          });

          remainingToDeduct -= deduct;
        }

        const finalUserEmailLimit = Math.max(0, (campaign.user.emailLimit || 0) - remainingToDeduct);

        await prisma.user.update({
          where: { id: campaign.userId },
          data: { emailLimit: finalUserEmailLimit },
        });

        // Update campaign
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            sentCount: actualSentCount,
            status: results.failed.length === 0 ? "sent" : "failed",
          },
        });

        // Create automation log
        await prisma.automationLog.create({
          data: {
            userId: campaign.userId,
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: results.failed.length === 0 ? "sent" : "failed",
            message: `Scheduled campaign sent: ${results.success.length} success, ${results.failed.length} failed`,
            error: results.failed.length > 0 ? `${results.failed.length} emails failed` : null,
          },
        });

        console.log(`✅ Campaign ${campaign.id} completed - Success: ${results.success.length}, Failed: ${results.failed.length}`);

      } catch (campaignError) {
        console.error(`❌ Error processing campaign ${campaign.id}:`, campaignError);

        // Mark campaign as failed
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: "failed" },
        });

        // Log error
        await prisma.automationLog.create({
          data: {
            userId: campaign.userId,
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: "failed",
            message: "Scheduled campaign failed to send",
            error: campaignError.message,
          },
        });
      }
    }

    console.log(`\n✅ Scheduled campaign processing complete\n`);

  } catch (error) {
    console.error("❌ Error in scheduled campaign processor:", error);
  }
}

/* ==========================================================
   🔄 START CRON JOB (runs every minute)
========================================================== */
export function startScheduledCampaignCron() {
  console.log("🚀 Starting scheduled campaign cron job (runs every minute)");

  // Run every minute: "* * * * *"
  cron.schedule("* * * * *", () => {
    processScheduledCampaigns();
  });

  // Also run immediately on startup to catch any missed campaigns
  processScheduledCampaigns();
}

export default startScheduledCampaignCron;