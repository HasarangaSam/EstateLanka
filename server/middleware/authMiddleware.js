import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const authenticateUser = async (req, res, next) => {
  try {
    // Get the Authorization header.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Extract the actual token.
    const accessToken = authHeader.split(" ")[1];

    // Verify the token.
    let decoded;

    try {
      decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired access token",
      });
    }

    // Find the user associated with the token.
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    // Store the authenticated user on the request.
    req.user = user;

    // Continue to the next middleware/controller.
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};
