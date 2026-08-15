import express from "express";

import {
  createInquiry,
  getMyInquiries,
  getSellerInquiries,
  replyToInquiry,
} from "../controllers/inquiryController.js";

import { inquiryLimiter } from "../middleware/rateLimitMiddleware.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ============================================================
// BUYER ROUTES
// ============================================================

// Send an inquiry about a property.
router.post(
  "/",
  inquiryLimiter,
  authenticateUser,
  authorizeRoles("buyer"),
  createInquiry,
);

// Get logged-in buyer's inquiries.
router.get("/my", authenticateUser, authorizeRoles("buyer"), getMyInquiries);

// ============================================================
// SELLER ROUTES
// ============================================================

// Get inquiries received by the logged-in seller.
router.get(
  "/seller",
  authenticateUser,
  authorizeRoles("seller"),
  getSellerInquiries,
);

// Reply to an inquiry.
router.patch(
  "/:id/reply",
  inquiryLimiter,
  authenticateUser,
  authorizeRoles("seller"),
  replyToInquiry,
);

export default router;
