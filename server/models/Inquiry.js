import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer is required"],
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },

    message: {
      type: String,
      required: [true, "Inquiry message is required"],
      trim: true,
      minlength: [5, "Message must be at least 5 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    reply: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Reply cannot exceed 2000 characters"],
    },

    status: {
      type: String,
      enum: ["pending", "replied"],
      default: "pending",
    },

    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

inquirySchema.index({ buyer: 1, createdAt: -1 });
inquirySchema.index({ seller: 1, createdAt: -1 });
inquirySchema.index({ property: 1, createdAt: -1 });
inquirySchema.index({ seller: 1, status: 1 });

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
