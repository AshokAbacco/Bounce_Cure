import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import { prisma } from "../prisma/prismaClient.js";
import sendEmail from '../utils/emailService.js';
import { generateOTP } from "../utils/generateOTP.js";
import { generateQRCode } from "../utils/generateQRCode.js";
import speakeasy from 'speakeasy'; // for TOTP 2FA


// Signup
export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { firstName, lastName, email, password: hashedPassword }
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                profileImage: user.profileImage || null

            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Create login log
        await prisma.loginLog.create({
            data: {
                userId: user.id,
                ipAddress: req.ip,
                device: req.headers['user-agent'],
                location: 'Unknown'
            }
        });

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                ipAddress: req.ip,
                device: req.headers['user-agent']
            }
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                profileImage: user.profileImage || null

            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get login logs
export const getLoginLogs = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isAdmin = (req.user.role || "").toUpperCase() === "ADMIN";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await prisma.loginLog.findMany({
            where: isAdmin ? {} : { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        });

        const totalLogs = await prisma.loginLog.count({
            where: isAdmin ? {} : { userId: req.user.id }
        });

        res.status(200).json({
            success: true,
            message: "Login logs fetched successfully",
            pagination: {
                total: totalLogs,
                page,
                limit,
                totalPages: Math.ceil(totalLogs / limit)
            },
            data: logs
        });
    } catch (error) {
        console.error("Error fetching login logs:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Send verification email
export const sendVerificationEmail = async (req, res) => {
    const { email } = req.user;
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const link = `${process.env.BASE_URL}/verify-email?token=${token}`;

    await sendEmail(email, "Verify your email", `<a href="${link}">Verify Email</a>`);
    res.json({ message: "Verification email sent" });
};

// Verify email
export const verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await prisma.user.update({
            where: { email: decoded.email },
            data: { isVerified: true }
        });
        res.json({ message: "Email verified successfully" });
    } catch {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

// Send OTP
export const sendOTP = async (user) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiry (preferable with a separate OTP model)
    await prisma.oTPCode.create({
        data: {
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            userId: user.id,
        },
    });

    await sendEmail(user.email, "Your OTP Code", `Your OTP is: ${otp}`);


    return otp;
};


// Change password
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user || !user.password) {
            return res.status(404).json({ message: "User not found or password missing" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed }
        });

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Enable 2FA
// authController.js

export const enable2FA = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Call sendOTP with the user object to generate and send OTP
        await sendOTP(user);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const verify2FA = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find the latest valid OTP for the user
        const otpRecord = await prisma.oTPCode.findFirst({
            where: {
                userId,
                code: otp,
                expiresAt: { gt: new Date() },  // not expired
            },
            orderBy: { expiresAt: 'desc' }
        });

        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        // Enable 2FA on user and delete the OTP record after successful verification
        await prisma.user.update({
            where: { id: userId },
            data: { is2FAEnabled: true },
        });

        await prisma.oTPCode.deleteMany({ where: { userId } });

        res.json({ message: '2FA enabled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Fixed backend version of getSecurityLogs
export const getSecurityLogs = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const logs = await prisma.loginLog.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            take: 5,  // <-- limits to 4 rows
        });

        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        console.error("Error fetching security logs:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get active sessions
export const getActiveSessions = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const sessions = await prisma.session.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            take: 5,  // <-- limits to 4 rows
        });

        res.status(200).json({ success: true, data: sessions });
    } catch (err) {
        console.error("Error fetching sessions:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const verifyAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

export const testEmail = async (req, res) => {
    try {
        await sendEmail({
            to: "user@example.com",
            subject: "Test Email",
            html: "<h1>Hello from Ethereal!</h1>",
        });

        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
};




