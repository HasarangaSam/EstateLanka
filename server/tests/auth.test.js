import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../app.js";

import User from "../models/User.js";
import OTP from "../models/OTP.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import RefreshToken from "../models/RefreshToken.js";

// ============================================================
// MOCK EMAIL FUNCTIONS
// ============================================================

vi.mock("../utils/sendEmail.js", () => ({
  sendOtpEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// ============================================================
// MOCK OTP GENERATOR
// ============================================================

vi.mock("../utils/generateOtp.js", () => ({
  generateOtp: vi.fn(() => "123456"),
}));

// ============================================================
// MOCK CLOUDINARY UPLOAD
// ============================================================

vi.mock("../utils/uploadToCloudinary.js", () => ({
  uploadToCloudinary: vi.fn(async () => ({
    secure_url: "https://test-cloudinary.com/avatar.jpg",
    public_id: "test-avatar-id",
  })),
}));

// ============================================================
// MOCK RATE LIMITERS
// ============================================================

vi.mock("../middleware/rateLimitMiddleware.js", () => ({
  generalLimiter: (req, res, next) => next(),

  authLimiter: (req, res, next) => next(),

  registerLimiter: (req, res, next) => next(),

  passwordLimiter: (req, res, next) => next(),

  otpLimiter: (req, res, next) => next(),

  propertyWriteLimiter: (req, res, next) => next(),

  propertyReadLimiter: (req, res, next) => next(),

  inquiryLimiter: (req, res, next) => next(),

  favouriteLimiter: (req, res, next) => next(),

  adminLimiter: (req, res, next) => next(),
}));

// ============================================================
// MONGODB MEMORY SERVER
// ============================================================

let mongoServer;

// ============================================================
// SETUP
// ============================================================

beforeAll(async () => {
  // Start temporary MongoDB
  mongoServer = await MongoMemoryServer.create();

  const mongoUri = mongoServer.getUri();

  // Connect Mongoose to temporary MongoDB
  await mongoose.connect(mongoUri);
});

// ============================================================
// CLEANUP
// ============================================================

afterAll(async () => {
  await mongoose.connection.dropDatabase();

  await mongoose.connection.close();

  await mongoServer.stop();
});

// ============================================================
// RESET DATABASE BEFORE EACH TEST
// ============================================================

beforeEach(async () => {
  await User.deleteMany({});
  await OTP.deleteMany({});
  await PasswordResetToken.deleteMany({});
  await RefreshToken.deleteMany({});
});

// ============================================================
// REGISTER
// ============================================================

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Account created successfully. Please check your email for the verification code.",
    );

    expect(response.body.email).toBe("test@example.com");

    // Check user
    const user = await User.findOne({
      email: "test@example.com",
    });

    expect(user).not.toBeNull();

    expect(user.name).toBe("Test User");

    expect(user.role).toBe("buyer");

    // Password must be hashed
    expect(user.password).not.toBe("password123");

    expect(user.password.length).toBeGreaterThan(20);

    // User should not be verified yet
    expect(user.isVerified).toBe(false);

    // Check OTP
    const otp = await OTP.findOne({
      email: "test@example.com",
    });

    expect(otp).not.toBeNull();

    // OTP should also be hashed
    expect(otp.otp).not.toBe("123456");
  });

  // ----------------------------------------------------------
  // EXISTING EMAIL
  // ----------------------------------------------------------

  it("should reject registration with an existing email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First User",
      email: "test@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: "test@example.com",
      phone: "0779876543",
      password: "password456",
      role: "seller",
    });

    expect(response.status).toBe(409);

    expect(response.body.message).toBe(
      "An account with this email already exists",
    );
  });

  // ----------------------------------------------------------
  // INVALID ROLE
  // ----------------------------------------------------------

  it("should reject an invalid account role", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Admin Hacker",
      email: "hacker@example.com",
      phone: "0771234567",
      password: "password123",
      role: "admin",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Invalid account role");
  });

  // ----------------------------------------------------------
  // SHORT PASSWORD
  // ----------------------------------------------------------

  it("should reject a password shorter than 8 characters", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Weak Password User",
      email: "weak@example.com",
      phone: "0771234567",
      password: "1234567",
      role: "buyer",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Password must be at least 8 characters",
    );
  });

  // ----------------------------------------------------------
  // MISSING FIELDS
  // ----------------------------------------------------------

  it("should reject registration when required fields are missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Incomplete User",
      email: "incomplete@example.com",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Please provide all required fields");
  });
});

// ============================================================
// VERIFY OTP
// ============================================================

describe("POST /api/auth/verify-otp", () => {
  it("should verify the user's email with the correct OTP", async () => {
    await request(app).post("/api/auth/register").send({
      name: "OTP Test User",
      email: "otp@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    const response = await request(app).post("/api/auth/verify-otp").send({
      email: "otp@example.com",
      otp: "123456",
    });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Email verified successfully. You can now log in.",
    );

    const user = await User.findOne({
      email: "otp@example.com",
    });

    expect(user).not.toBeNull();

    expect(user.isVerified).toBe(true);

    // OTP should be deleted
    const otpRecord = await OTP.findOne({
      email: "otp@example.com",
    });

    expect(otpRecord).toBeNull();
  });

  // ----------------------------------------------------------
  // WRONG OTP
  // ----------------------------------------------------------

  it("should reject an incorrect OTP", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Wrong OTP User",
      email: "wrongotp@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    const response = await request(app).post("/api/auth/verify-otp").send({
      email: "wrongotp@example.com",
      otp: "999999",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Invalid OTP");

    const user = await User.findOne({
      email: "wrongotp@example.com",
    });

    expect(user.isVerified).toBe(false);
  });

  // ----------------------------------------------------------
  // MISSING OTP
  // ----------------------------------------------------------

  it("should reject verification when email or OTP is missing", async () => {
    const response = await request(app).post("/api/auth/verify-otp").send({
      email: "test@example.com",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Email and OTP are required");
  });
});

// ============================================================
// RESEND OTP
// ============================================================

describe("POST /api/auth/resend-otp", () => {
  it("should resend a new OTP for an unverified user", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Resend User",
      email: "resend@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    const oldOtp = await OTP.findOne({
      email: "resend@example.com",
    });

    expect(oldOtp).not.toBeNull();

    const response = await request(app).post("/api/auth/resend-otp").send({
      email: "resend@example.com",
    });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "A new verification code has been sent to your email",
    );

    const newOtp = await OTP.findOne({
      email: "resend@example.com",
    });

    expect(newOtp).not.toBeNull();

    expect(newOtp._id.toString()).not.toBe(oldOtp._id.toString());
  });

  // ----------------------------------------------------------
  // ALREADY VERIFIED
  // ----------------------------------------------------------

  it("should reject resend OTP for an already verified user", async () => {
    await User.create({
      name: "Verified User",
      email: "verified@example.com",
      phone: "0771234567",
      password: "$2b$12$hashedpassword",
      role: "buyer",
      isVerified: true,
    });

    const response = await request(app).post("/api/auth/resend-otp").send({
      email: "verified@example.com",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("This email is already verified");
  });

  // ----------------------------------------------------------
  // USER NOT FOUND
  // ----------------------------------------------------------

  it("should reject resend OTP when the user does not exist", async () => {
    const response = await request(app).post("/api/auth/resend-otp").send({
      email: "unknown@example.com",
    });

    expect(response.status).toBe(404);

    expect(response.body.message).toBe("User account not found");
  });
});

// ============================================================
// LOGIN
// ============================================================

describe("POST /api/auth/login", () => {
  it("should login a verified user successfully", async () => {
    // Register
    await request(app).post("/api/auth/register").send({
      name: "Login User",
      email: "login@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    // Verify OTP
    await request(app).post("/api/auth/verify-otp").send({
      email: "login@example.com",
      otp: "123456",
    });

    // Login
    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe("Login successful");

    // Access token should be returned
    expect(response.body.accessToken).toBeDefined();

    expect(typeof response.body.accessToken).toBe("string");

    // User should be returned
    expect(response.body.user).toBeDefined();

    expect(response.body.user.email).toBe("login@example.com");

    expect(response.body.user.role).toBe("buyer");

    // Refresh token cookie should exist
    expect(response.headers["set-cookie"]).toBeDefined();

    expect(
      response.headers["set-cookie"].some((cookie) =>
        cookie.startsWith("refreshToken="),
      ),
    ).toBe(true);

    // Refresh token should be stored in database
    const refreshToken = await RefreshToken.findOne({
      user: (await User.findOne({ email: "login@example.com" }))._id,
    });

    expect(refreshToken).not.toBeNull();

    // Token must be hashed in DB
    expect(refreshToken.token).not.toBe(response.headers["set-cookie"][0]);
  });

  // ----------------------------------------------------------
  // WRONG PASSWORD
  // ----------------------------------------------------------

  it("should reject login with an incorrect password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Wrong Password",
      email: "wrongpassword@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    await request(app).post("/api/auth/verify-otp").send({
      email: "wrongpassword@example.com",
      otp: "123456",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "wrongpassword@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);

    expect(response.body.message).toBe("Invalid email or password");
  });

  // ----------------------------------------------------------
  // UNVERIFIED USER
  // ----------------------------------------------------------

  it("should reject login when email is not verified", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Unverified User",
      email: "unverified@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "unverified@example.com",
      password: "password123",
    });

    expect(response.status).toBe(403);

    expect(response.body.message).toBe(
      "Please verify your email before logging in",
    );
  });

  // ----------------------------------------------------------
  // USER NOT FOUND
  // ----------------------------------------------------------

  it("should reject login when user does not exist", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);

    expect(response.body.message).toBe("Invalid email or password");
  });

  // ----------------------------------------------------------
  // MISSING FIELDS
  // ----------------------------------------------------------

  it("should reject login when email or password is missing", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Email and password are required");
  });
});

// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

describe("POST /api/auth/refresh", () => {
  it("should generate a new access token using a valid refresh token", async () => {
    // Register
    await request(app).post("/api/auth/register").send({
      name: "Refresh User",
      email: "refresh@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    // Verify
    await request(app).post("/api/auth/verify-otp").send({
      email: "refresh@example.com",
      otp: "123456",
    });

    // Login and keep cookies
    const agent = request.agent(app);

    const loginResponse = await agent.post("/api/auth/login").send({
      email: "refresh@example.com",
      password: "password123",
    });

    expect(loginResponse.status).toBe(200);

    // Use stored cookie
    const response = await agent.post("/api/auth/refresh");

    expect(response.status).toBe(200);

    expect(response.body.accessToken).toBeDefined();

    expect(typeof response.body.accessToken).toBe("string");
  });

  // ----------------------------------------------------------
  // NO COOKIE
  // ----------------------------------------------------------

  it("should return null access token when refresh cookie is missing", async () => {
    const response = await request(app).post("/api/auth/refresh");

    expect(response.status).toBe(200);

    expect(response.body.accessToken).toBeNull();

    expect(response.body.message).toBe("No refresh token provided");
  });
});

// ============================================================
// LOGOUT
// ============================================================

describe("POST /api/auth/logout", () => {
  it("should logout successfully and remove refresh token", async () => {
    // Register
    await request(app).post("/api/auth/register").send({
      name: "Logout User",
      email: "logout@example.com",
      phone: "0771234567",
      password: "password123",
      role: "buyer",
    });

    // Verify
    await request(app).post("/api/auth/verify-otp").send({
      email: "logout@example.com",
      otp: "123456",
    });

    // Keep cookies
    const agent = request.agent(app);

    // Login
    const loginResponse = await agent.post("/api/auth/login").send({
      email: "logout@example.com",
      password: "password123",
    });

    expect(loginResponse.status).toBe(200);

    // Refresh token should exist
    const user = await User.findOne({
      email: "logout@example.com",
    });

    let refreshToken = await RefreshToken.findOne({
      user: user._id,
    });

    expect(refreshToken).not.toBeNull();

    // Logout
    const logoutResponse = await agent.post("/api/auth/logout");

    expect(logoutResponse.status).toBe(200);

    expect(logoutResponse.body.message).toBe("Logged out successfully");

    // Refresh token should be deleted
    refreshToken = await RefreshToken.findOne({
      user: user._id,
    });

    expect(refreshToken).toBeNull();
  });
});

// ============================================================
// FORGOT PASSWORD
// ============================================================

describe("POST /api/auth/forgot-password", () => {
  it("should create a password reset token for an existing user", async () => {
    const user = await User.create({
      name: "Forgot Password User",
      email: "forgot@example.com",
      phone: "0771234567",
      password: "$2b$12$hashedpassword",
      role: "buyer",
      isVerified: true,
    });

    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "forgot@example.com",
    });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "If an account exists with this email, a password reset link has been sent",
    );

    // Check reset token was created
    const resetToken = await PasswordResetToken.findOne({
      user: user._id,
    });

    expect(resetToken).not.toBeNull();

    expect(resetToken.tokenHash).toBeDefined();

    expect(resetToken.expiresAt).toBeDefined();

    // Raw token should NOT be stored
    expect(resetToken.tokenHash.length).toBe(64);
  });

  // ----------------------------------------------------------
  // UNKNOWN EMAIL
  // ----------------------------------------------------------

  it("should return the same response when email does not exist", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "unknown@example.com",
    });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "If an account exists with this email, a password reset link has been sent",
    );

    // No token should be created
    const token = await PasswordResetToken.findOne({});

    expect(token).toBeNull();
  });

  // ----------------------------------------------------------
  // MISSING EMAIL
  // ----------------------------------------------------------

  it("should reject forgot password when email is missing", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Email is required");
  });
});

// ============================================================
// RESET PASSWORD
// ============================================================

describe("POST /api/auth/reset-password", () => {
  it("should reset the user's password successfully", async () => {
    const user = await User.create({
      name: "Reset Password User",
      email: "reset@example.com",
      phone: "0771234567",
      password: "$2b$12$oldpasswordhash",
      role: "buyer",
      isVerified: true,
    });

    // Create a reset token manually.
    const crypto = await import("crypto");

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    const response = await request(app).post("/api/auth/reset-password").send({
      token: rawToken,
      newPassword: "newpassword123",
    });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Password reset successfully. Please log in with your new password.",
    );

    // Reload user
    const updatedUser = await User.findById(user._id);

    expect(updatedUser.password).not.toBe("$2b$12$oldpasswordhash");

    // Old password should not be stored
    expect(updatedUser.password).not.toBe("newpassword123");

    // Reset token should be deleted
    const resetToken = await PasswordResetToken.findOne({
      user: user._id,
    });

    expect(resetToken).toBeNull();
  });

  // ----------------------------------------------------------
  // INVALID TOKEN
  // ----------------------------------------------------------

  it("should reject an invalid reset token", async () => {
    const response = await request(app).post("/api/auth/reset-password").send({
      token: "invalid-token",
      newPassword: "newpassword123",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Invalid or expired password reset link",
    );
  });

  // ----------------------------------------------------------
  // SHORT PASSWORD
  // ----------------------------------------------------------

  it("should reject a new password shorter than 8 characters", async () => {
    const response = await request(app).post("/api/auth/reset-password").send({
      token: "some-token",
      newPassword: "1234567",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Password must be at least 8 characters",
    );
  });

  // ----------------------------------------------------------
  // MISSING DATA
  // ----------------------------------------------------------

  it("should reject reset password when token or password is missing", async () => {
    const response = await request(app).post("/api/auth/reset-password").send({
      token: "some-token",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Reset token and new password are required",
    );
  });
});
