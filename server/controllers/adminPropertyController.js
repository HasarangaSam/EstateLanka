import mongoose from "mongoose";

import Property from "../models/Property.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

// ============================================================
// GET ALL ADMIN PROPERTIES
// ============================================================

export const getAdminProperties = async (req, res) => {
  try {
    const {
      status,
      district,
      propertyType,
      listingType,
      search,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    // Start with an empty filter.
    const filter = {};

    // Filter by property status.
    if (status) {
      filter.status = status;
    }

    // Filter by district.
    if (district) {
      filter["location.district"] = district;
    }

    // Filter by property type.
    if (propertyType) {
      filter.propertyType = propertyType;
    }

    // Filter by listing type.
    if (listingType) {
      filter.listingType = listingType;
    }

    // Search property title, description, city or district.
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { "location.city": searchRegex },
        { "location.district": searchRegex },
        { "location.address": searchRegex },
        { propertyType: searchRegex },
      ];
    }

    // ========================================================
    // PAGINATION
    // ========================================================

    const currentPage = Math.max(Number(page), 1);

    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (currentPage - 1) * itemsPerPage;

    // ========================================================
    // SORTING
    // ========================================================

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "price-low") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortOption = {
        price: -1,
      };
    }

    // Get properties and total count together.
    const [properties, totalProperties] = await Promise.all([
      Property.find(filter)
        .populate("seller", "name email phone avatar")
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage),

      Property.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProperties / itemsPerPage);

    return res.status(200).json({
      properties,

      pagination: {
        currentPage,
        itemsPerPage,
        totalProperties,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get admin properties error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting properties",
    });
  }
};

// ============================================================
// GET SINGLE ADMIN PROPERTY
// ============================================================

export const getAdminPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id).populate(
      "seller",
      "name email phone avatar",
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    return res.status(200).json({
      property,
    });
  } catch (error) {
    console.error("Get admin property error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting the property",
    });
  }
};

// ============================================================
// GET ADMIN STATS
// ============================================================

export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalProperties, usersByRole, propertiesByStatus] =
      await Promise.all([
        User.countDocuments(),
        Property.countDocuments(),
        User.aggregate([
          { $group: { _id: "$role", count: { $sum: 1 } } },
        ]),
        Property.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

    const roleMap = { buyer: 0, seller: 0, admin: 0 };
    usersByRole.forEach(({ _id, count }) => {
      if (roleMap[_id] !== undefined) roleMap[_id] = count;
    });

    const statusMap = { pending: 0, approved: 0, sold: 0 };
    propertiesByStatus.forEach(({ _id, count }) => {
      if (statusMap[_id] !== undefined) statusMap[_id] = count;
    });

    return res.status(200).json({
      totalUsers,
      totalProperties,
      usersByRole: roleMap,
      propertiesByStatus: statusMap,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching stats",
    });
  }
};

// ============================================================
// DELETE PROPERTY AS ADMIN
// ============================================================

export const deleteAdminProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Delete all property images from Cloudinary.
    if (property.images.length > 0) {
      await Promise.all(
        property.images.map((image) =>
          cloudinary.uploader.destroy(image.publicId),
        ),
      );
    }

    await property.deleteOne();

    return res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete property error:", error);

    return res.status(500).json({
      message: "Something went wrong while deleting the property",
    });
  }
};
