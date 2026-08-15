import bcrypt from "bcryptjs";

import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import RefreshToken from "../models/RefreshToken.js";

// ============================================================
// GET CURRENT USER
// ============================================================

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting user information",
    });
  }
};

// ============================================================
// UPDATE PROFILE
// ============================================================

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Find the currently logged-in user.
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ========================================================
    // UPDATE BASIC PROFILE INFORMATION
    // ========================================================

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    // ========================================================
    // UPDATE AVATAR
    // ========================================================

    if (req.file) {
      // If the user already has an avatar,
      // delete the old image from Cloudinary first.
      if (user.avatar) {
        try {
          const avatarUrl = user.avatar;

          // Get the part of the Cloudinary URL after /upload/.
          const uploadPath = avatarUrl.split("/upload/")[1];

          if (uploadPath) {
            const pathParts = uploadPath.split("/");

            // Remove Cloudinary version number.
            // Example: v1234567890
            if (pathParts[0].startsWith("v")) {
              pathParts.shift();
            }

            // Remove the file extension.
            const fileName = pathParts.pop();

            const publicId = [...pathParts, fileName.split(".")[0]].join("/");

            await cloudinary.uploader.destroy(publicId);
          }
        } catch (error) {
          // If deleting the old avatar fails,
          // continue with uploading the new avatar.
          console.error("Old avatar deletion error:", error);
        }
      }

      // Upload the new avatar to a separate Cloudinary folder.
      const uploadedAvatar = await uploadToCloudinary(
        req.file.buffer,
        "estatelanka/avatars",
      );

      user.avatar = uploadedAvatar.secure_url;
    }

    // Mongoose validation runs when the user is saved.
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (validationError) => validationError.message,
      );

      return res.status(400).json({
        message: "Profile validation failed",
        errors,
      });
    }

    return res.status(500).json({
      message: "Something went wrong while updating your profile",
    });
  }
};

// ============================================================
// CHANGE PASSWORD
// ============================================================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Both passwords are required.
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    // Get the user directly from MongoDB.
    // We need the stored password hash to verify
    // the current password.
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ========================================================
    // VERIFY CURRENT PASSWORD
    // ========================================================

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // ========================================================
    // VALIDATE NEW PASSWORD
    // ========================================================

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    // Make sure the new password is different
    // from the current password.
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // ========================================================
    // HASH NEW PASSWORD
    // ========================================================

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Something went wrong while changing the password",
    });
  }
};

// ============================================================
// DELETE ACCOUNT
// ============================================================

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete avatar from Cloudinary if present.
    if (user.avatar) {
      try {
        const uploadPath = user.avatar.split("/upload/")[1];
        if (uploadPath) {
          const pathParts = uploadPath.split("/");
          if (pathParts[0].startsWith("v")) pathParts.shift();
          const fileName = pathParts.pop();
          const publicId = [...pathParts, fileName.split(".")[0]].join("/");
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error("Avatar deletion error on account delete:", err);
      }
    }

    // Remove all refresh tokens for this user.
    await RefreshToken.deleteMany({ user: user._id });

    // Delete the user account.
    await User.findByIdAndDelete(user._id);

    // Clear the refresh token cookie.
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Something went wrong while deleting the account",
    });
  }
};
