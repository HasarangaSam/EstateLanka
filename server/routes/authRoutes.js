import express from "express";

import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import {
  authLimiter,
  registerLimiter,
  passwordLimiter,
  otpLimiter,
} from "../middleware/rateLimitMiddleware.js";

import { uploadAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerLimiter, uploadAvatar, registerUser);

router.post("/verify-otp", otpLimiter, verifyOtp);

router.post("/resend-otp", otpLimiter, resendOtp);

router.post("/login", authLimiter, loginUser);

router.post("/refresh", authLimiter, refreshAccessToken);

router.post("/logout", authLimiter, logoutUser);

router.post("/forgot-password", passwordLimiter, forgotPassword);

router.post("/reset-password", passwordLimiter, resetPassword);

export default router;
