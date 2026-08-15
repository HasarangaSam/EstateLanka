import express from "express";

import {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  markPropertyAsSold,
} from "../controllers/propertyController.js";

import { propertyWriteLimiter } from "../middleware/rateLimitMiddleware.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadPropertyImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================

// Get all approved/sold properties
// Supports search, filtering, sorting and pagination.
router.get("/", getProperties);

// ============================================================
// SELLER ROUTES
// ============================================================

// Get logged-in seller's properties
router.get(
  "/my-properties",
  authenticateUser,
  authorizeRoles("seller"),
  getMyProperties,
);

// Create property
router.post(
  "/",
  propertyWriteLimiter,
  authenticateUser,
  authorizeRoles("seller"),
  uploadPropertyImages,
  createProperty,
);

// Update seller's own property
router.patch(
  "/:id",
  propertyWriteLimiter,
  authenticateUser,
  authorizeRoles("seller"),
  uploadPropertyImages,
  updateProperty,
);

// Delete seller's own property
router.delete(
  "/:id",
  propertyWriteLimiter,
  authenticateUser,
  authorizeRoles("seller"),
  deleteProperty,
);

// Mark seller's approved property as sold
router.patch(
  "/:id/sold",
  propertyWriteLimiter,
  authenticateUser,
  authorizeRoles("seller"),
  markPropertyAsSold,
);

// Get a single approved/sold property.
router.get("/:id", getPropertyById);

export default router;
