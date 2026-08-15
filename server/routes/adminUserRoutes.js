import express from "express";

import {
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../controllers/adminUserController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Every route in this file requires an admin.
router.use(authenticateUser, authorizeRoles("admin"));

// ============================================================
// ADMIN USER ROUTES
// ============================================================

// Get all users.
router.get("/", getAdminUsers);

// Create new user as admin.
router.post("/", createAdminUser);

// Get a single user.
router.get("/:id", getAdminUserById);

// Update user (details, role, verification, password).
router.put("/:id", updateAdminUser);
router.patch("/:id", updateAdminUser);
router.patch("/:id/role", updateAdminUser);

// Delete user.
router.delete("/:id", deleteAdminUser);

export default router;
