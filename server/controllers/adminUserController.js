import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

// ============================================================
// GET ALL USERS
// ============================================================

export const getAdminUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, sort = "newest" } = req.query;

    // Start with an empty filter.
    const filter = {};

    // Filter by role.
    if (role) {
      filter.role = role;
    }

    // Search by name, email or phone.
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
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

    if (sort === "name") {
      sortOption = {
        name: 1,
      };
    }

    // Never return passwords from admin user queries.
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage),

      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    return res.status(200).json({
      users,

      pagination: {
        currentPage,
        itemsPerPage,
        totalUsers,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting users",
    });
  }
};

// ============================================================
// GET SINGLE USER
// ============================================================

export const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get admin user error:", error);

    return res.status(500).json({
      message: "Something went wrong while getting the user",
    });
  }
};

// ============================================================
// CREATE USER (ADMIN)
// ============================================================

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, phone, password, role = "buyer", isVerified = true } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Name, email, phone, and password are required",
      });
    }

    const allowedRoles = ["buyer", "seller", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role,
      isVerified,
    });

    const userWithoutPassword = await User.findById(user._id).select("-password");

    return res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Create admin user error:", error);
    return res.status(500).json({
      message: "Something went wrong while creating the user",
    });
  }
};

// ============================================================
// UPDATE USER DETAILS (ADMIN)
// ============================================================

export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isVerified, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check email uniqueness if email is changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (emailExists) {
        return res.status(400).json({
          message: "Email is already taken by another user",
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    if (role) {
      const allowedRoles = ["buyer", "seller", "admin"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid user role",
        });
      }
      // Prevent changing own role if logged-in admin
      if (id === req.user._id.toString() && role !== "admin") {
        return res.status(400).json({
          message: "You cannot remove your own admin role",
        });
      }
      user.role = role;
    }

    if (typeof isVerified === "boolean") {
      user.isVerified = isVerified;
    }

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update admin user error:", error);
    return res.status(500).json({
      message: "Something went wrong while updating the user",
    });
  }
};

// ============================================================
// DELETE USER
// ============================================================

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Prevent the admin from deleting their own account.
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin user error:", error);

    return res.status(500).json({
      message: "Something went wrong while deleting the user",
    });
  }
};
