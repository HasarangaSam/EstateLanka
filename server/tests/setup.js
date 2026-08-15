import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

// ============================================================
// BEFORE ALL TESTS
// ============================================================

export const connectTestDB = async () => {
  // Create a temporary MongoDB server
  mongoServer = await MongoMemoryServer.create();

  // Get the temporary MongoDB connection URL
  const mongoUri = mongoServer.getUri();

  // Connect Mongoose to the temporary database
  await mongoose.connect(mongoUri);

  console.log("Test MongoDB connected");
};

// ============================================================
// AFTER ALL TESTS
// ============================================================

export const disconnectTestDB = async () => {
  // Close Mongoose connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  // Stop the temporary MongoDB server
  await mongoServer.stop();

  console.log("Test MongoDB disconnected");
};
