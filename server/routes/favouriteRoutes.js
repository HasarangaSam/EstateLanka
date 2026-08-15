import express from "express";

import {
  addFavourite,
  getMyFavourites,
  removeFavourite,
} from "../controllers/favouriteController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ============================================================
// BUYER FAVOURITE ROUTES
// ============================================================

// Get logged-in buyer's favourites.
router.get("/", authenticateUser, authorizeRoles("buyer"), getMyFavourites);

// Add a property to favourites.
router.post(
  "/:propertyId",
  authenticateUser,
  authorizeRoles("buyer"),
  addFavourite,
);

// Remove a property from favourites.
router.delete(
  "/:propertyId",
  authenticateUser,
  authorizeRoles("buyer"),
  removeFavourite,
);

export default router;
