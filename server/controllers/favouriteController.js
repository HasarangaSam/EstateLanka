import mongoose from "mongoose";

import Favourite from "../models/Favourite.js";
import Property from "../models/Property.js";

// ============================================================
// ADD PROPERTY TO FAVOURITES
// ============================================================

export const addFavourite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check whether the property ID is valid.
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    // Only approved properties can be favourited.
    const property = await Property.findOne({
      _id: propertyId,
      status: {
        $in: ["approved"],
      },
    });

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Check whether this property is already in the
    // buyer's favourites.
    const existingFavourite = await Favourite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existingFavourite) {
      return res.status(409).json({
        message: "Property is already in your favourites",
      });
    }

    // Create the favourite.
    const favourite = await Favourite.create({
      user: req.user._id,
      property: propertyId,
    });

    return res.status(201).json({
      message: "Property added to favourites",
      favourite,
    });
  } catch (error) {
    console.error("Add favourite error:", error);

    // This protects against duplicate favourites if two
    // requests happen at almost exactly the same time.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Property is already in your favourites",
      });
    }

    return res.status(500).json({
      message: "Something went wrong while adding the favourite",
    });
  }
};

// ============================================================
// GET MY FAVOURITES
// ============================================================

export const getMyFavourites = async (req, res) => {
  try {
    const favourites = await Favourite.find({
      user: req.user._id,
    })
      .populate({
        path: "property",
        populate: {
          path: "seller",
          select: "name phone avatar",
        },
      })
      .sort({
        createdAt: -1,
      });

    // Filter out favourites where property is missing, deleted, or sold (not approved).
    const activeFavourites = favourites.filter(
      (fav) => fav.property && fav.property.status === "approved",
    );

    return res.status(200).json({
      favourites: activeFavourites,
    });
  } catch (error) {
    console.error("Get favourites error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting your favourites",
    });
  }
};

// ============================================================
// REMOVE PROPERTY FROM FAVOURITES
// ============================================================

export const removeFavourite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check whether the property ID is valid.
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    // Find the favourite belonging to the logged-in buyer.
    const favourite = await Favourite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (!favourite) {
      return res.status(404).json({
        message: "Property is not in your favourites",
      });
    }

    await favourite.deleteOne();

    return res.status(200).json({
      message: "Property removed from favourites",
    });
  } catch (error) {
    console.error("Remove favourite error:", error);

    return res.status(500).json({
      message: "Something went wrong while removing the favourite",
    });
  }
};
