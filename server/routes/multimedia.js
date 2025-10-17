import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';
const router = express.Router();
const prisma = new PrismaClient();

// Create campaign in database
async function createMmsCampaign(data) {
  const { name, message, mediaUrl, recipients } = data;

  const campaign = await prisma.mmsCampaign.create({
    data: {
      name,
      message,
      mediaUrl,
      recipients: {
        create: recipients.map(phone => ({ phone }))
      }
    },
    include: {
      recipients: true
    }
  });

  return campaign;
}

// Get all campaigns
async function getAllMmsCampaigns() {
  return await prisma.mmsCampaign.findMany({
    include: {
      recipients: true
    }
  });
}

// Get campaign by ID
async function getMmsCampaignById(id) {
  return await prisma.mmsCampaign.findUnique({
    where: { id: Number(id) },
    include: {
      recipients: true
    }
  });
}

// Create a new campaign
router.post('/',
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
  body('mediaUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  body('recipients').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('recipients.*')
    .matches(/^\+\d{7,15}$/)
    .withMessage('Each recipient must be a valid phone number in E.164 format'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const campaign = await createMmsCampaign(req.body);

      console.log("MMS campaign created successfully!");
      console.log("Campaign ID:", campaign.id);
      console.log("Campaign Name:", campaign.name);
      console.log("Recipients:", campaign.recipients.map(r => r.phone));

      // Send either MMS or SMS depending on mediaUrl
      const sendResults = await Promise.all(
        campaign.recipients.map(recipient => {
          if (campaign.mediaUrl) {
            return sendMms(recipient.phone, campaign.message, campaign.mediaUrl);
          } else {
            return sendSms(recipient.phone, campaign.message);
          }
        })
      );

      console.log("Messages sent!");
      sendResults.forEach((result, index) => {
        console.log(`Recipient: ${campaign.recipients[index].phone}, SID: ${result.sid || 'N/A'}`);
      });

      res.status(201).json({
        message: 'Campaign created and messages sent successfully!',
        campaign,
        sendResults
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await getAllMmsCampaigns();
    console.log("Fetched all campaigns. Count:", campaigns.length);
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a campaign by ID
router.get('/:id',
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const campaign = await getMmsCampaignById(req.params.id);
      if (!campaign) {
        console.warn(`Campaign not found with ID: ${req.params.id}`);
        return res.status(404).json({ error: 'Campaign not found' });
      }
      console.log("Fetched campaign by ID:", campaign.id);
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
