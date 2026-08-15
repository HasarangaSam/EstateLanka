import bcrypt from "bcryptjs";

import User from "../models/User.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

import RefreshToken from "../models/RefreshToken.js";

import { hashToken } from "../utils/hashToken.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Make sure all required fields were provided.
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Only buyer and seller accounts can be created through registration.
    // Admin accounts must be created manually.
    if (!["buyer", "seller"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account role",
      });
    }

    // Check whether the email is already registered.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // Basic password validation.
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Handle avatar upload if provided
    let avatarUrl = "";
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "estatelanka/avatars",
        );
        avatarUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Avatar upload error during registration:", uploadError);
      }
    }

    // Hash the password before storing it.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user.
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      avatar: avatarUrl,
      isVerified: false,
    });

    // Generate a six-digit OTP.
    const otp = generateOtp();

    // Hash the OTP before storing it.
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Remove any previous OTP for this email.
    await OTP.deleteMany({ email });

    // Save the new OTP.
    await OTP.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send the original OTP to the user's email.
    await sendOtpEmail(email, otp);

    return res.status(201).json({
      message:
        "Account created successfully. Please check your email for the verification code.",
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Something went wrong while creating the account",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // Find the user's OTP record.
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP is invalid or has expired",
      });
    }

    // Compare the OTP entered by the user with the hashed OTP.
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isOtpValid) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Find the user.
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    // Mark the account as verified.
    user.isVerified = true;

    await user.save();

    // OTP is no longer needed.
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      message: "Something went wrong while verifying the OTP",
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "This email is already verified",
      });
    }

    // Generate a new OTP.
    const otp = generateOtp();

    // Hash it before storing.
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Remove the previous OTP.
    await OTP.deleteMany({ email });

    // Store the new OTP for 10 minutes.
    await OTP.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send the new OTP.
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "A new verification code has been sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      message: "Something went wrong while resending the OTP",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Do not reveal whether an email exists.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent",
      });
    }

    // Remove any previous reset tokens for this user.
    await PasswordResetToken.deleteMany({
      user: user._id,
    });

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing it.
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 30 minutes.
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt,
    });

    // Send the RAW token to the user's email.
    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while processing your password reset request",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the token received from the reset link.
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find the reset token.
    const resetToken = await PasswordResetToken.findOne({
      tokenHash,
    });

    if (!resetToken) {
      return res.status(400).json({
        message: "Invalid or expired password reset link",
      });
    }

    // Check expiration.
    if (resetToken.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({
        _id: resetToken._id,
      });

      return res.status(400).json({
        message: "Password reset link has expired",
      });
    }

    // Find the user.
    const user = await User.findById(resetToken.user);

    if (!user) {
      await PasswordResetToken.deleteOne({
        _id: resetToken._id,
      });

      return res.status(400).json({
        message: "Invalid password reset link",
      });
    }

    // Hash the new password.
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password.
    user.password = hashedPassword;

    await user.save();

    // Delete the reset token.
    // This makes the reset link one-time use.
    await PasswordResetToken.deleteOne({
      _id: resetToken._id,
    });

    // Invalidate existing refresh tokens.
    await RefreshToken.deleteMany({
      user: user._id,
    });

    return res.status(200).json({
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Something went wrong while resetting your password",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check that the required login fields were provided.
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find the user by email.
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // The user must verify their email before logging in.
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    // Compare the password entered by the user
    // with the hashed password stored in MongoDB.
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate short-lived access token.
    const accessToken = generateAccessToken(user._id.toString(), user.role);

    // Generate long-lived refresh token.
    const refreshToken = generateRefreshToken(user._id.toString());

    // Hash the refresh token before storing it.
    const hashedRefreshToken = hashToken(refreshToken);

    // Remove existing refresh tokens for this user.
    await RefreshToken.deleteMany({
      user: user._id,
    });

    // Calculate refresh token expiration time.
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    // Save the hashed refresh token.
    await RefreshToken.create({
      user: user._id,
      token: hashedRefreshToken,
      expiresAt: refreshTokenExpiresAt,
    });

    // Store the actual refresh token in an HTTP-only cookie.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",

      accessToken,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Something went wrong while logging in",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    // Read the refresh token from the HTTP-only cookie.
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({
        accessToken: null,
        message: "No refresh token provided",
      });
    }

    // Verify that the refresh token was created by our server
    // and has not expired.
    let decoded;

    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    // Hash the token so we can compare it with the
    // hashed token stored in MongoDB.
    const hashedRefreshToken = hashToken(refreshToken);

    // Find the matching refresh token in the database.
    const storedToken = await RefreshToken.findOne({
      token: hashedRefreshToken,
      user: decoded.userId,
    });

    if (!storedToken) {
      return res.status(401).json({
        message: "Refresh token is no longer valid",
      });
    }

    // Check the database expiration as an additional safety check.
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({
        _id: storedToken._id,
      });

      return res.status(401).json({
        message: "Refresh token has expired",
      });
    }

    // Make sure the user still exists.
    const user = await User.findById(decoded.userId);

    if (!user) {
      await RefreshToken.deleteOne({
        _id: storedToken._id,
      });

      return res.status(401).json({
        message: "User account no longer exists",
      });
    }

    // Generate a new short-lived access token.
    const accessToken = generateAccessToken(user._id.toString(), user.role);

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    return res.status(500).json({
      message: "Something went wrong while refreshing the access token",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const hashedRefreshToken = hashToken(refreshToken);

      // Remove the refresh token from MongoDB.
      await RefreshToken.deleteOne({
        token: hashedRefreshToken,
      });
    }

    // Remove the refresh-token cookie from the browser.
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Something went wrong while logging out",
    });
  }
};
