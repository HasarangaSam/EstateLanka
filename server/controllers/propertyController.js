import mongoose from "mongoose";
import Property from "../models/Property.js";
import cloudinary from "../config/cloudinary.js";
import redis from "../config/redis.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// ============================================================
// REDIS CACHE HELPERS
// ============================================================

const createPropertyCacheKey = (query) => {
  const {
    search = "",
    district = "",
    city = "",
    propertyType = "",
    listingType = "",
    minPrice = "",
    maxPrice = "",
    bedrooms = "",
    bathrooms = "",
    sort = "newest",
    page = "1",
    limit = "12",
  } = query;

  const cacheData = {
    search,
    district,
    city,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    sort,
    page,
    limit,
  };

  return `properties:${JSON.stringify(cacheData)}`;
};

const invalidatePropertyCache = async () => {
  try {
    const keys = await redis.keys("properties:*");

    if (keys.length > 0) {
      await redis.del(...keys);

      console.log(`Invalidated ${keys.length} property cache entries`);
    }
  } catch (redisError) {
    console.error("Redis cache invalidation error:", redisError.message);
  }
};

// ============================================================
// CREATE PROPERTY
// ============================================================

export const createProperty = async (req, res) => {
  let uploadedImages = [];

  try {
    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      address,
      district,
      city,
      lat,
      lng,
      coordinates,
      bedrooms,
      bathrooms,
      area,
    } = req.body;

    let coords = null;
    if (lat !== undefined && lng !== undefined && lat !== "" && lng !== "") {
      coords = { lat: Number(lat), lng: Number(lng) };
    } else if (coordinates) {
      try {
        const parsed =
          typeof coordinates === "string"
            ? JSON.parse(coordinates)
            : coordinates;
        if (parsed && parsed.lat != null && parsed.lng != null) {
          coords = { lat: Number(parsed.lat), lng: Number(parsed.lng) };
        }
      } catch (e) {}
    }

    // At least one image is required.
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one property image is required",
      });
    }

    // Maximum 8 images per property.
    if (req.files.length > 8) {
      return res.status(400).json({
        message: "A property can have a maximum of 8 images",
      });
    }

    // Create a temporary property object so Mongoose
    // can validate all property fields before uploading images.
    const propertyData = {
      title,
      description,
      propertyType,
      listingType,
      price: Number(price),

      location: {
        address,
        district,
        city,
        coordinates: coords,
      },

      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),

      seller: req.user._id,
      status: "approved",
    };

    const property = new Property(propertyData);

    // Validate property information first.
    await property.validate();

    // Upload all images to Cloudinary.
    uploadedImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer)),
    );

    // Save both the Cloudinary URL and public ID.
    property.images = uploadedImages.map((image) => ({
      url: image.secure_url,
      publicId: image.public_id,
    }));

    // Save property.
    await property.save();

    // Clear old property listing caches.
    await invalidatePropertyCache();

    return res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    // If Cloudinary uploads succeeded but MongoDB failed,
    // remove the uploaded images so we don't leave orphaned images.
    if (uploadedImages.length > 0) {
      await Promise.allSettled(
        uploadedImages.map((image) =>
          cloudinary.uploader.destroy(image.public_id),
        ),
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (validationError) => validationError.message,
      );

      return res.status(400).json({
        message: "Property validation failed",
        errors,
      });
    }

    return res.status(500).json({
      message: "Something went wrong while creating the property",
    });
  }
};

// ============================================================
// GET ALL PUBLIC PROPERTIES
// ============================================================

export const getProperties = async (req, res) => {
  try {
    const cacheKey = createPropertyCacheKey(req.query);
    let cachedData = null;

    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {
      console.error("Redis GET error:", redisError.message);
    }

    if (cachedData) {


      return res.status(200).json(cachedData);
    }



    const {
      search,
      district,
      city,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    // Only approved properties are public.
    const filter = {
      status: "approved",
    };

    // ========================================================
    // SEARCH
    // ========================================================

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
    // FILTERS
    // ========================================================

    if (district) {
      filter["location.district"] = district;
    }

    if (city && city.trim() !== "") {
      filter["location.city"] = {
        $regex: city.trim(),
        $options: "i",
      };
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (listingType) {
      filter.listingType = listingType;
    }

    // ========================================================
    // PRICE FILTER
    // ========================================================

    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);

    if (
      minPrice !== undefined &&
      minPrice !== "" &&
      Number.isFinite(parsedMinPrice) &&
      parsedMinPrice >= 0
    ) {
      filter.price = {
        $gte: parsedMinPrice,
      };
    }

    if (
      maxPrice !== undefined &&
      maxPrice !== "" &&
      Number.isFinite(parsedMaxPrice) &&
      parsedMaxPrice >= 0
    ) {
      if (!filter.price) {
        filter.price = {};
      }

      filter.price.$lte = parsedMaxPrice;
    }

    // ========================================================
    // BEDROOM FILTER
    // ========================================================

    const parsedBedrooms = Number(bedrooms);

    if (
      bedrooms !== undefined &&
      bedrooms !== "" &&
      Number.isFinite(parsedBedrooms) &&
      parsedBedrooms >= 0
    ) {
      filter.bedrooms = {
        $gte: parsedBedrooms,
      };
    }

    // ========================================================
    // BATHROOM FILTER
    // ========================================================

    const parsedBathrooms = Number(bathrooms);

    if (
      bathrooms !== undefined &&
      bathrooms !== "" &&
      Number.isFinite(parsedBathrooms) &&
      parsedBathrooms >= 0
    ) {
      filter.bathrooms = {
        $gte: parsedBathrooms,
      };
    }

    // ========================================================
    // PAGINATION
    // ========================================================

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const currentPage =
      Number.isFinite(parsedPage) && parsedPage >= 1
        ? Math.floor(parsedPage)
        : 1;

    const itemsPerPage =
      Number.isFinite(parsedLimit) && parsedLimit >= 1
        ? Math.min(Math.floor(parsedLimit), 50)
        : 12;

    const skip = (currentPage - 1) * itemsPerPage;

    // ========================================================
    // SORTING
    // ========================================================

    let sortOption = {
      createdAt: -1,
    };

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

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "bedrooms") {
      sortOption = {
        bedrooms: -1,
      };
    }

    // Get properties and total count at the same time.
    const [properties, totalProperties] = await Promise.all([
      Property.find(filter)
        .populate("seller", "name email phone avatar")
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage),

      Property.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProperties / itemsPerPage);

    const responseData = {
      properties,

      pagination: {
        currentPage,
        itemsPerPage,
        totalProperties,
        totalPages,
      },
    };

    // ========================================================
    // SAVE RESULT TO REDIS
    // ========================================================

    // Store the response in Redis for 5 minutes.
    try {
      await redis.set(cacheKey, responseData, {
        ex: 300,
      });


    } catch (redisError) {
      console.error("Redis SET error:", redisError.message);
    }

    // ========================================================
    // SEND RESPONSE
    // ========================================================

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Get properties error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting properties",
    });
  }
};

// ============================================================
// GET SINGLE PUBLIC PROPERTY
// ============================================================

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the ID has a valid MongoDB format.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findOne({
      _id: id,
      status: "approved",
    }).populate("seller", "name email phone avatar");

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    return res.status(200).json({
      property,
    });
  } catch (error) {
    console.error("Get property by ID error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting property",
    });
  }
};

// ============================================================
// GET SELLER'S OWN PROPERTIES
// ============================================================

export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      seller: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      properties,
    });
  } catch (error) {
    console.error("Get my properties error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting your properties",
    });
  }
};

// ============================================================
// UPDATE PROPERTY
// ============================================================

export const updateProperty = async (req, res) => {
  let newlyUploadedImages = [];

  try {
    const { id } = req.params;

    // Check whether the ID has a valid MongoDB format.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    // Find the property and make sure it belongs
    // to the logged-in seller.
    const property = await Property.findOne({
      _id: id,
      seller: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Sold properties cannot be edited.
    if (property.status === "sold") {
      return res.status(400).json({
        message: "Sold properties cannot be edited",
      });
    }

    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      address,
      district,
      city,
      lat,
      lng,
      coordinates,
      bedrooms,
      bathrooms,
      area,
      existingImages,
    } = req.body;

    // ========================================================
    // UPDATE PROPERTY INFORMATION
    // ========================================================

    if (title !== undefined) {
      property.title = title;
    }

    if (description !== undefined) {
      property.description = description;
    }

    if (propertyType !== undefined) {
      property.propertyType = propertyType;
    }

    if (listingType !== undefined) {
      property.listingType = listingType;
    }

    if (price !== undefined) {
      property.price = Number(price);
    }

    if (address !== undefined) {
      property.location.address = address;
    }

    if (district !== undefined) {
      property.location.district = district;
    }

    if (city !== undefined) {
      property.location.city = city;
    }

    if (lat !== undefined && lng !== undefined) {
      if (lat === "" || lng === "" || lat === null || lng === null) {
        property.location.coordinates = { lat: null, lng: null };
      } else {
        property.location.coordinates = { lat: Number(lat), lng: Number(lng) };
      }
    } else if (coordinates !== undefined) {
      try {
        const parsed =
          typeof coordinates === "string"
            ? JSON.parse(coordinates)
            : coordinates;
        if (parsed && parsed.lat != null && parsed.lng != null) {
          property.location.coordinates = {
            lat: Number(parsed.lat),
            lng: Number(parsed.lng),
          };
        }
      } catch (e) {}
    }

    if (bedrooms !== undefined) {
      property.bedrooms = Number(bedrooms);
    }

    if (bathrooms !== undefined) {
      property.bathrooms = Number(bathrooms);
    }

    if (area !== undefined) {
      property.area = Number(area);
    }

    // ========================================================
    // HANDLE EXISTING IMAGES
    // ========================================================

    let imagesToKeep = property.images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
    }));

    if (existingImages !== undefined) {
      try {
        imagesToKeep =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;
      } catch (error) {
        return res.status(400).json({
          message: "Invalid existing images data",
        });
      }

      // Make sure existingImages is actually an array.
      if (!Array.isArray(imagesToKeep)) {
        return res.status(400).json({
          message: "Existing images must be an array",
        });
      }
    }

    // ========================================================
    // ORIGINAL IMAGES
    // ========================================================

    const originalImages = property.images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
    }));

    // ========================================================
    // REMOVE DUPLICATE EXISTING IMAGES
    // ========================================================

    const uniquePublicIds = new Set();

    imagesToKeep = imagesToKeep.filter((image) => {
      if (uniquePublicIds.has(image.publicId)) {
        return false;
      }

      uniquePublicIds.add(image.publicId);

      return true;
    });

    // ========================================================
    // FIND IMAGES THAT WERE REMOVED
    // ========================================================

    const keptPublicIds = imagesToKeep.map((image) => image.publicId);

    const removedImages = originalImages.filter(
      (image) => !keptPublicIds.includes(image.publicId),
    );

    // ========================================================
    // UPLOAD NEW IMAGES
    // ========================================================

    if (req.files && req.files.length > 0) {
      // Make sure the total number of images doesn't exceed 8.
      if (imagesToKeep.length + req.files.length > 8) {
        return res.status(400).json({
          message: "A property can have a maximum of 8 images",
        });
      }

      newlyUploadedImages = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer)),
      );
    }

    const newImageData = newlyUploadedImages.map((image) => ({
      url: image.secure_url,
      publicId: image.public_id,
    }));

    // ========================================================
    // CREATE FINAL IMAGE ARRAY
    // ========================================================

    const finalImages = [...imagesToKeep, ...newImageData];

    // A property must always have at least one image.
    if (finalImages.length === 0) {
      return res.status(400).json({
        message: "A property must have at least one image",
      });
    }

    // Maximum 8 images.
    if (finalImages.length > 8) {
      return res.status(400).json({
        message: "A property can have a maximum of 8 images",
      });
    }

    property.images = finalImages;

    // Remove previous rejection reason if any.
    property.rejectionReason = "";

    // Validate the complete updated property.
    await property.validate();

    // ========================================================
    // SAVE PROPERTY FIRST
    // ========================================================

    await property.save();

    // Clear old property listing caches.
    await invalidatePropertyCache();

    // ========================================================
    // DELETE REMOVED IMAGES FROM CLOUDINARY
    // ========================================================

    if (removedImages.length > 0) {
      await Promise.allSettled(
        removedImages.map((image) =>
          cloudinary.uploader.destroy(image.publicId),
        ),
      );
    }

    return res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Update property error:", error);

    // If new images were uploaded but the property update failed,
    // remove those new images from Cloudinary.
    if (newlyUploadedImages.length > 0) {
      await Promise.allSettled(
        newlyUploadedImages.map((image) =>
          cloudinary.uploader.destroy(image.public_id),
        ),
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (validationError) => validationError.message,
      );

      return res.status(400).json({
        message: "Property validation failed",
        errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid property data",
      });
    }

    return res.status(500).json({
      message: "Something went wrong while updating the property",
    });
  }
};

// ============================================================
// DELETE PROPERTY
// ============================================================

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the ID has a valid MongoDB format.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findOne({
      _id: id,
      seller: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Sold properties cannot be deleted by sellers.
    if (property.status === "sold") {
      return res.status(400).json({
        message: "Sold properties cannot be deleted",
      });
    }

    // Delete all property images from Cloudinary.
    if (property.images.length > 0) {
      await Promise.allSettled(
        property.images.map((image) =>
          cloudinary.uploader.destroy(image.publicId),
        ),
      );
    }

    // Delete the property from MongoDB.
    await property.deleteOne();

    // Clear old property listing caches.
    await invalidatePropertyCache();

    return res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    return res.status(500).json({
      message: "Something went wrong while deleting the property",
    });
  }
};

// ============================================================
// MARK PROPERTY AS SOLD
// ============================================================

export const markPropertyAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the ID has a valid MongoDB format.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findOne({
      _id: id,
      seller: req.user._id,
    });

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Only approved properties can become sold.
    if (property.status !== "approved") {
      return res.status(400).json({
        message: "Only approved properties can be marked as sold",
      });
    }

    property.status = "sold";

    await property.save();

    // Clear old property listing caches.
    await invalidatePropertyCache();

    return res.status(200).json({
      message: "Property marked as sold successfully",
      property,
    });
  } catch (error) {
    console.error("Mark property as sold error:", error);

    return res.status(500).json({
      message: "Something went wrong while marking property as sold",
    });
  }
};
