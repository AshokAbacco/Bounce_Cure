// server/middleware/auth.js
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prismaClient.js";

// Protect routes (fetch full user)
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Authorization header missing or malformed");
    return res.status(401).json({ message: "Not authorized, no Bearer token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, // keep type consistent (UUID or Int)
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Store user object
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Lightweight auth check (no DB query, just token validation)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Authorization header missing or malformed");
    return res.status(401).json({ message: "Authorization token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains { id, email }
    next();
  } catch (error) {
    console.error("Token verification failed (verifyToken):", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Logout session by deleting from DB
export const logoutSession = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { sessionId } = req.params;

    await prisma.session.delete({
      where: { id: parseInt(sessionId, 10) },
    });

    res.status(200).json({ success: true, message: "Session logged out" });
  } catch (err) {
    console.error("Error logging out session:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};