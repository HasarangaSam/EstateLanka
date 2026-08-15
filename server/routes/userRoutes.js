import express from "express";

import {
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/userController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import { uploadAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ============================================================
// AUTHENTICATED USER ROUTES
// ============================================================

router.get("/me", authenticateUser, getCurrentUser);

router.patch("/profile", authenticateUser, uploadAvatar, updateProfile);

router.patch("/change-password", authenticateUser, changePassword);

router.delete("/account", authenticateUser, deleteAccount);

export default router;
