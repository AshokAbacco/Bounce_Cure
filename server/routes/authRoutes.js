// authRoutes.js
import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { protect, authMiddleware } from "../middleware/authMiddleware.js";
import {
    sendVerificationEmail,
    verifyEmail,
    sendOTP,
    changePassword,
    enable2FA,
    getSecurityLogs,
    getActiveSessions,
    verify2FA,
    verifyAuth
    // getLoginLogs
} from "../controllers/authController.js";
import { testEmail } from "../controllers/authController.js";
import {
    updateEmail,
    updateName,
    uploadProfileImage,
    getMe,
    getProfileImage
} from '../controllers/userController.js';

import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage(); // ← no need to save file to disk

// Multer setup for image upload
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
// });
const upload = multer({ storage });

router.post('/signup', signup);
router.post('/login', login);

router.post("/send-verification-email", protect, sendVerificationEmail);
router.get('/verify-email', verifyEmail);
router.post("/send-otp", protect, sendOTP);
router.post("/change-password", protect, changePassword);
router.post("/2fa/enable", protect, enable2FA);
router.get("/security-logs", protect, getSecurityLogs);
router.get("/active-sessions", protect, getActiveSessions);
// router.get('/login-logs', authMiddleware, getLoginLogs);
router.get("/test-email", testEmail);
// authRoutes.js
router.post("/enable-2fa", protect, enable2FA);
router.post("/verify-2fa", protect, verify2FA);

router.get('/users/me', protect, getMe); // ✅ add this
router.put('/update-email', protect, updateEmail);
router.put('/update-name', protect, updateName);
router.put('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);

router.post('/auth/send-verification-email', verifyAuth, sendVerificationEmail);
router.get('/profile-image/:userId', getProfileImage);


export default router;
