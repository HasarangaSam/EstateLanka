import mongoose from "mongoose";

import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";

// ============================================================
// CREATE INQUIRY
// ============================================================

export const createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    // Check whether the property ID is valid.
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    // Find the property.
    // Only approved properties can receive new inquiries.
    const property = await Property.findOne({
      _id: propertyId,
      status: "approved",
    });

    if (!property) {
      return res.status(404).json({
        message: "Property not found or is no longer available",
      });
    }

    // A buyer cannot send an inquiry to their own property.
    if (property.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot send an inquiry about your own property",
      });
    }

    // Create the inquiry.
    // The seller is taken from the property, not from the request.
    const inquiry = await Inquiry.create({
      buyer: req.user._id,
      seller: property.seller,
      property: property._id,
      message,
    });

    return res.status(201).json({
      message: "Inquiry sent successfully",
      inquiry,
    });
  } catch (error) {
    console.error("Create inquiry error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (validationError) => validationError.message,
      );

      return res.status(400).json({
        message: "Inquiry validation failed",
        errors,
      });
    }

    return res.status(500).json({
      message: "Something went wrong while sending the inquiry",
    });
  }
};

// ============================================================
// GET BUYER'S OWN INQUIRIES
// ============================================================

export const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      buyer: req.user._id,
    })
      .populate("seller", "name email phone avatar")
      .populate(
        "property",
        "title price listingType propertyType images location status",
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      inquiries,
    });
  } catch (error) {
    console.error("Get buyer inquiries error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting your inquiries",
    });
  }
};

// ============================================================
// GET SELLER'S INQUIRIES
// ============================================================

export const getSellerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      seller: req.user._id,
    })
      .populate("buyer", "name email phone avatar")
      .populate(
        "property",
        "title price listingType propertyType images location status",
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      inquiries,
    });
  } catch (error) {
    console.error("Get seller inquiries error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting seller inquiries",
    });
  }
};

// ============================================================
// REPLY TO INQUIRY
// ============================================================

export const replyToInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    // Check whether the inquiry ID is valid.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid inquiry ID",
      });
    }

    // Find the inquiry belonging to the logged-in seller.
    const inquiry = await Inquiry.findOne({
      _id: id,
      seller: req.user._id,
    });

    if (!inquiry) {
      return res.status(404).json({
        message: "Inquiry not found",
      });
    }

    // Closed inquiries cannot receive another reply.
    if (inquiry.status === "closed") {
      return res.status(400).json({
        message: "Closed inquiries cannot be replied to",
      });
    }

    inquiry.reply = reply;
    inquiry.status = "replied";
    inquiry.repliedAt = new Date();

    await inquiry.save();

    return res.status(200).json({
      message: "Reply sent successfully",
      inquiry,
    });
  } catch (error) {
    console.error("Reply to inquiry error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (validationError) => validationError.message,
      );

      return res.status(400).json({
        message: "Inquiry validation failed",
        errors,
      });
    }

    return res.status(500).json({
      message: "Something went wrong while replying to the inquiry",
    });
  }
};
