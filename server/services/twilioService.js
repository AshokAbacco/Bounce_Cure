// // server/services/twilioService.js

// server/services/twilioService.js
import Twilio from "twilio";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Dynamically get a Twilio client for a given user
 */
export async function getUserTwilioClient(userId) {
  const config = await prisma.twilioConfig.findUnique({ where: { userId } });
  if (!config) throw new Error("No Twilio configuration found for this user");

  return Twilio(config.accountSid, config.authToken);
}

/**
 * Send a WhatsApp or SMS message using user's Twilio credentials
 */
export async function sendUserMessage({ userId, to, body, mediaUrl, channel }) {
  const config = await prisma.twilioConfig.findUnique({ where: { userId } });
  if (!config) throw new Error("User Twilio config not found");

  const client = Twilio(config.accountSid, config.authToken);
  const from =
    channel === "whatsapp"
      ? `whatsapp:${config.whatsappNumber}`
      : config.smsNumber;

  const payload = {
    from,
    to: channel === "whatsapp" ? `whatsapp:${to}` : to,
    body,
  };

  if (mediaUrl) payload.mediaUrl = [mediaUrl];

  const message = await client.messages.create(payload);
  return { sid: message.sid, status: message.status };
}










// import Twilio from "twilio";
// import dotenv from "dotenv";
// dotenv.config();

// const client = Twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// /**
//  * Send an SMS or WhatsApp message via Twilio
//  * @param {Object} options
//  * @param {string} options.to - Recipient phone number in E.164 format (+91...)
//  * @param {string} options.body - Message text
//  * @param {string} [options.mediaUrl] - Optional media URL
//  * @param {string} options.channel - "sms" or "whatsapp"
//  */
// export async function sendMessage({ to, body, mediaUrl, channel }) {

//   try {
//     const from =
//       channel === "whatsapp"
//         ? process.env.TWILIO_WHATSAPP_FROM
//         : process.env.TWILIO_SMS_FROM;

//     const payload = {
//       from,
//       to: channel === "whatsapp" ? `whatsapp:${to}` : to,
//       body,
//     };

//     if (mediaUrl) payload.mediaUrl = [mediaUrl];

//     const message = await client.messages.create(payload);
//     return { sid: message.sid, status: message.status };
//   } catch (error) {
//     console.error("Twilio sendMessage error:", error.message);
//     throw new Error(error.message);
//   }
// }
