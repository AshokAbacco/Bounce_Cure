//server/routes/twilioConfig.js

import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

// Save or update Twilio credentials
router.post("/setup", protect, async (req, res) => {
    const { accountSid, authToken, whatsappNumber, smsNumber, messagingService } = req.body;
    const userId = req.user.id;

    try {
        const existing = await prisma.twilioConfig.findUnique({ where: { userId } });

        let config;
        if (existing) {
            config = await prisma.twilioConfig.update({
                where: { userId },
                data: { accountSid, authToken, whatsappNumber, smsNumber, messagingService },
            });
        } else {
            config = await prisma.twilioConfig.create({
                data: { userId, accountSid, authToken, whatsappNumber, smsNumber, messagingService },
            });
        }

        return res.json({ success: true, config });
    } catch (err) {
        console.error("Twilio setup error:", err);
        res.status(500).json({ error: "Failed to save Twilio config" });
    }
});

// Get current user's Twilio config
router.get("/config", protect, async (req, res) => {
    const userId = req.user.id;
    const config = await prisma.twilioConfig.findUnique({ where: { userId } });
    res.json(config);
});

export default router;
