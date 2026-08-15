import mongoose from "mongoose";

const sriLankanDistricts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      enum: ["house", "apartment"],
    },

    listingType: {
      type: String,
      required: [true, "Listing type is required"],
      enum: ["sale", "rent"],
    },

    price: {
      type: Number,
      required: [true, "Property price is required"],
      min: [0, "Price cannot be negative"],
    },

    location: {
      address: {
        type: String,
        required: [true, "Property address is required"],
        trim: true,
        maxlength: [300, "Address cannot exceed 300 characters"],
      },

      district: {
        type: String,
        required: [true, "District is required"],
        enum: {
          values: sriLankanDistricts,
          message: "Please select a valid Sri Lankan district",
        },
      },

      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxlength: [100, "City cannot exceed 100 characters"],
      },

      coordinates: {
        lat: {
          type: Number,
          default: null,
        },
        lng: {
          type: Number,
          default: null,
        },
      },
    },

    bedrooms: {
      type: Number,
      required: [true, "Number of bedrooms is required"],
      min: [0, "Bedrooms cannot be negative"],
    },

    bathrooms: {
      type: Number,
      required: [true, "Number of bathrooms is required"],
      min: [0, "Bathrooms cannot be negative"],
    },

    area: {
      type: Number,
      required: [true, "Property area is required"],
      min: [0, "Area cannot be negative"],
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          required: true,
        },
      },
    ],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "sold"],
      default: "approved",
    },

  },
  {
    timestamps: true,
  },
);

propertySchema.index({ seller: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ "location.district": 1 });
propertySchema.index({ "location.city": 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ createdAt: -1 });

propertySchema.index({
  title: "text",
  description: "text",
  "location.city": "text",
  "location.district": "text",
});

const Property = mongoose.model("Property", propertySchema);

export { sriLankanDistricts };
export default Property;
