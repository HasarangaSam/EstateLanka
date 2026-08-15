import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import favouriteRoutes from "./routes/favouriteRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import adminPropertyRoutes from "./routes/adminPropertyRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

import { generalLimiter } from "./middleware/rateLimitMiddleware.js";

import redis from "./config/redis.js";

const app = express();

// Trust reverse proxy (Render, Vercel, Nginx) so client IP rate limiting works per user
app.set("trust proxy", 1);

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ============================================================
// TEST ROUTE
// ============================================================

app.get("/", (req, res) => {
  res.json({
    message: "EstateLanka API is running",
  });
});

// ============================================================
// GENERAL RATE LIMITER
// ============================================================

app.use("/api", generalLimiter);

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/properties", propertyRoutes);

app.use("/api/favourites", favouriteRoutes);

app.use("/api/inquiries", inquiryRoutes);

app.use("/api/admin/properties", adminPropertyRoutes);

app.use("/api/admin/users", adminUserRoutes);

export default app;
