import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
  },
  {
    timestamps: true,
  },
);

favouriteSchema.index({ user: 1, property: 1 }, { unique: true });
favouriteSchema.index({ user: 1, createdAt: -1 });

const Favourite = mongoose.model("Favourite", favouriteSchema);

export default Favourite;
