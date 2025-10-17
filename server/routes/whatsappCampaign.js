//server/routes/whatsappCampaign.js

import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middleware/authMiddleware.js";
import Twilio from "twilio";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/send", protect, async (req, res) => {
    const { name, message, recipients, mediaUrl, schedule } = req.body;
    const userId = req.user.id;

    try {
        const creds = await prisma.twilioConfig.findUnique({ where: { userId } });
        if (!creds) return res.status(400).json({ error: "Twilio config not found" });

        const client = Twilio(creds.accountSid, creds.authToken);

        const campaign = await prisma.whatsappCampaign.create({
            data: { userId, name, message, mediaUrl, schedule: schedule ? new Date(schedule) : null },
        });

        for (const phone of recipients) {
            try {
                const msg = await client.messages.create({
                    from: `whatsapp:${creds.whatsappNumber}`,
                    to: `whatsapp:${phone}`,
                    body: message,
                    ...(mediaUrl ? { mediaUrl: [mediaUrl] } : {}),
                });

                await prisma.whatsappRecipient.create({
                    data: { phone, status: msg.status, whatsappCampaignId: campaign.id },
                });
            } catch (err) {
                await prisma.whatsappRecipient.create({
                    data: { phone, status: "failed", error: err.message, whatsappCampaignId: campaign.id },
                });
            }
        }

        res.json({ success: true, campaignId: campaign.id });
    } catch (err) {
        console.error("WhatsApp campaign error:", err);
        res.status(500).json({ error: "Failed to send WhatsApp campaign" });
    }
});

export default router;
