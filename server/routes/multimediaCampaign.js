// server/routes/multimediaCampaign.js

import express from "express";
import { PrismaClient } from "@prisma/client";
import { sendUserMessage } from "../services/twilioService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/multimedia-campaign/send
 * Body: { channel: "sms" | "whatsapp", recipients: [numbers], message, mediaUrl?, schedule? }
 */
router.post("/send", protect, async (req, res) => {
    const { channel, recipients, message, mediaUrl, schedule } = req.body;
    const userId = req.user.id;

    if (!recipients?.length || !message) {
        return res.status(400).json({ error: "Recipients and message are required" });
    }

    const results = [];

    /**
     * 🔹 Helper function: send messages immediately
     */
    const sendNow = async (campaignId) => {
        for (const to of recipients) {
            try {
                const result = await sendUserMessage({
                    userId,
                    to,
                    body: message,
                    mediaUrl,
                    channel,
                });

                // Save recipient log in DB
                if (channel === "whatsapp") {
                    await prisma.whatsappRecipient.create({
                        data: {
                            phone: to,
                            status: result.status || "queued",
                            whatsappCampaignId: campaignId,
                        },
                    });
                } else {
                    await prisma.smsRecipient.create({
                        data: {
                            phone: to,
                            status: result.status || "queued",
                            smsCampaignId: campaignId,
                        },
                    });
                }

                results.push({ to, ...result });
            } catch (err) {
                console.error("❌ Error sending to:", to, err.message);

                // Save failed recipient
                if (channel === "whatsapp") {
                    await prisma.whatsappRecipient.create({
                        data: {
                            phone: to,
                            status: "failed",
                            error: err.message,
                            whatsappCampaignId: campaignId,
                        },
                    });
                } else {
                    await prisma.smsRecipient.create({
                        data: {
                            phone: to,
                            status: "failed",
                            error: err.message,
                            smsCampaignId: campaignId,
                        },
                    });
                }

                results.push({ to, error: err.message });
            }
        }
    };

    try {
        /**
         * 🔹 Create a campaign record first (so we can link recipients)
         */
        const campaign =
            channel === "whatsapp"
                ? await prisma.whatsappCampaign.create({
                    data: {
                        userId,
                        name: `${channel.toUpperCase()} Campaign - ${new Date().toLocaleString()}`,
                        message,
                        mediaUrl,
                        schedule: schedule ? new Date(schedule) : null,
                        status: schedule ? "scheduled" : "queued",
                    },
                })
                : await prisma.smsCampaign.create({
                    data: {
                        userId,
                        name: `${channel.toUpperCase()} Campaign - ${new Date().toLocaleString()}`,
                        message,
                        schedule: schedule ? new Date(schedule) : null,
                        status: schedule ? "scheduled" : "queued",
                    },
                });

        /**
         * 🕒 Handle scheduling (send later)
         */
        if (schedule) {
            const sendTime = new Date(schedule).getTime();
            const now = Date.now();

            if (isNaN(sendTime)) {
                return res.status(400).json({ error: "Invalid schedule time format" });
            }

            const delay = sendTime - now;

            if (delay > 0) {
                setTimeout(async () => {
                    console.log(`⏰ Scheduled campaign started for user ${userId}`);
                    await sendNow(campaign.id);
                    await prisma[
                        channel === "whatsapp" ? "whatsappCampaign" : "smsCampaign"
                    ].update({
                        where: { id: campaign.id },
                        data: { status: "sent" },
                    });
                }, delay);

                console.log(
                    `✅ Campaign scheduled for ${schedule} (in ${Math.round(delay / 1000)}s)`
                );

                return res.json({
                    success: true,
                    scheduled: true,
                    scheduledFor: schedule,
                    campaignId: campaign.id,
                    message: "Campaign scheduled successfully!",
                });
            } else {
                console.log("⚠️ Schedule time is in the past, sending immediately...");
            }
        }

        /**
         * 🚀 Send now (if no valid schedule)
         */
        await sendNow(campaign.id);

        // Mark campaign as sent
        await prisma[
            channel === "whatsapp" ? "whatsappCampaign" : "smsCampaign"
        ].update({
            where: { id: campaign.id },
            data: { status: "sent" },
        });

        return res.json({
            success: true,
            scheduled: false,
            campaignId: campaign.id,
            results,
        });
    } catch (error) {
        console.error("Campaign send error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ✅ NEW ROUTE: GET /api/multimedia-campaign/history
 * Returns WhatsApp + SMS campaigns + recipients for the logged-in user
 */
router.get("/history", protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all WhatsApp campaigns with recipients
        const whatsappCampaigns = await prisma.whatsappCampaign.findMany({
            where: { userId },
            include: { recipients: true },
            orderBy: { createdAt: "desc" },
        });

        // Fetch all SMS campaigns with recipients
        const smsCampaigns = await prisma.smsCampaign.findMany({
            where: { userId },
            include: { recipients: true },
            orderBy: { createdAt: "desc" },
        });

        return res.json({
            success: true,
            whatsappCampaigns,
            smsCampaigns,
        });
    } catch (error) {
        console.error("❌ Error fetching campaign history:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
