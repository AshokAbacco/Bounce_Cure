// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prismaClient.js";

// Full user authentication (includes database query)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("[protect] Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[protect] Authorization header missing or malformed:", authHeader);
      return res.status(401).json({ message: "Not authorized, no Bearer token" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.warn("[protect] No token extracted from header");
      return res.status(401).json({ message: "Token missing from header" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    console.log("[protect] Decoded token:", decoded);

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id, 10) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.warn("[protect] User not found for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[protect] Token verification failed:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    return res.status(401).json({ message: "Token verification failed" });
  }
};

// Lightweight token verification (no database query)
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("[verifyToken] Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[verifyToken] Authorization header missing or malformed:", authHeader);
      return res.status(401).json({ message: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.warn("[verifyToken] No token extracted from header");
      return res.status(401).json({ message: "Token missing from header" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    console.error("[verifyToken] Token verification failed:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Session logout handler
export const logoutSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    await prisma.session.delete({
      where: { id: parseInt(sessionId, 10) },
    });

    res.status(200).json({ success: true, message: "Session logged out successfully" });
  } catch (err) {
    console.error("[logoutSession] Error logging out session:", err);

    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};