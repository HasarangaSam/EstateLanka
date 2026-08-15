import express from "express";

import {
  getAdminProperties,
  getAdminPropertyById,
  deleteAdminProperty,
  getAdminStats,
} from "../controllers/adminPropertyController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes in this file require an admin.
router.use(authenticateUser, authorizeRoles("admin"));

// ============================================================
// ADMIN PROPERTY ROUTES
// ============================================================

// Get all properties.
router.get("/", getAdminProperties);

// Get admin stats.
router.get("/stats", getAdminStats);

// Get a single property.
router.get("/:id", getAdminPropertyById);

// Delete property.
router.delete("/:id", deleteAdminProperty);

export default router;
