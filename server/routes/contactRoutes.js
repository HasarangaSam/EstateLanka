import express from "express";
import { submitContactForm } from "../controllers/contactController.js";

const router = express.Router();

// Public route — anyone without logging in can submit a contact message
router.post("/", submitContactForm);

export default router;
