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
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";

vi.mock("../middleware/rateLimitMiddleware.js", () => ({
  generalLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  registerLimiter: (req, res, next) => next(),
  passwordLimiter: (req, res, next) => next(),
  otpLimiter: (req, res, next) => next(),
  propertyWriteLimiter: (req, res, next) => next(),
  inquiryLimiter: (req, res, next) => next(),
}));

const redisStore = new Map();

vi.mock("../config/redis.js", () => ({
  default: {
    get: vi.fn(async (key) => {
      return redisStore.get(key) || null;
    }),

    set: vi.fn(async (key, value) => {
      redisStore.set(key, value);
      return "OK";
    }),

    keys: vi.fn(async (pattern) => {
      const prefix = pattern.replace("*", "");

      return [...redisStore.keys()].filter((key) => key.startsWith(prefix));
    }),

    del: vi.fn(async (...keys) => {
      keys.forEach((key) => redisStore.delete(key));
      return keys.length;
    }),
  },
}));

vi.mock("../config/cloudinary.js", () => ({
  default: {
    uploader: {
      destroy: vi.fn(async () => ({
        result: "ok",
      })),
    },
  },
}));

vi.mock("../utils/uploadToCloudinary.js", () => ({
  uploadToCloudinary: vi.fn(async () => ({
    secure_url: "https://test-cloudinary.com/property-image.jpg",
    public_id: "estate-test/property-image",
  })),
}));

import app from "../app.js";
import User from "../models/User.js";
import Property from "../models/Property.js";

let mongoServer;

let seller;
let buyer;
let anotherSeller;

const createAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

const createTestProperty = async (sellerId, extraData = {}) => {
  return Property.create({
    title: "Beautiful House in Colombo",

    description:
      "A beautiful modern house located in a convenient area of Colombo.",

    propertyType: "house",

    listingType: "sale",

    price: 25000000,

    location: {
      address: "123 Main Street",
      district: "Colombo",
      city: "Colombo",

      coordinates: {
        lat: 6.9271,
        lng: 79.8612,
      },
    },

    bedrooms: 3,

    bathrooms: 2,

    area: 1800,

    images: [
      {
        url: "https://test-cloudinary.com/image1.jpg",
        publicId: "estate-test/image1",
      },
    ],

    seller: sellerId,

    status: "approved",

    ...extraData,
  });
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Property.deleteMany({});

  redisStore.clear();

  seller = await User.create({
    name: "Test Seller",
    email: "seller@example.com",
    phone: "0771234567",
    password: await bcrypt.hash("password123", 12),
    role: "seller",
    isVerified: true,
  });

  buyer = await User.create({
    name: "Test Buyer",
    email: "buyer@example.com",
    phone: "0771234568",
    password: await bcrypt.hash("password123", 12),
    role: "buyer",
    isVerified: true,
  });

  anotherSeller = await User.create({
    name: "Another Seller",
    email: "seller2@example.com",
    phone: "0771234569",
    password: await bcrypt.hash("password123", 12),
    role: "seller",
    isVerified: true,
  });
});

describe("POST /api/properties", () => {
  it("should create a property successfully", async () => {
    const token = createAccessToken(seller);

    const response = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Beautiful House in Gampaha")
      .field(
        "description",
        "A beautiful modern house located in a convenient area.",
      )
      .field("propertyType", "house")
      .field("listingType", "sale")
      .field("price", "15000000")
      .field("address", "123 Main Street")
      .field("district", "Gampaha")
      .field("city", "Gampaha")
      .field("bedrooms", "3")
      .field("bathrooms", "2")
      .field("area", "1800")
      .attach("images", Buffer.from("fake image data"), "house.jpg");

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Property created successfully");

    expect(response.body.property).toBeDefined();
    expect(response.body.property.title).toBe("Beautiful House in Gampaha");
    expect(response.body.property.seller).toBe(seller._id.toString());
    expect(response.body.property.images.length).toBe(1);

    const property = await Property.findOne({
      title: "Beautiful House in Gampaha",
    });

    expect(property).not.toBeNull();
    expect(property.price).toBe(15000000);
    expect(property.status).toBe("approved");
  });

  it("should reject property creation without authentication", async () => {
    const response = await request(app)
      .post("/api/properties")
      .field("title", "Beautiful House in Gampaha");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  it("should reject a buyer trying to create a property", async () => {
    const token = createAccessToken(buyer);

    const response = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Beautiful House in Gampaha")
      .field(
        "description",
        "A beautiful modern house located in a convenient area.",
      )
      .field("propertyType", "house")
      .field("listingType", "sale")
      .field("price", "15000000")
      .field("address", "123 Main Street")
      .field("district", "Gampaha")
      .field("city", "Gampaha")
      .field("bedrooms", "3")
      .field("bathrooms", "2")
      .field("area", "1800")
      .attach("images", Buffer.from("fake image data"), "house.jpg");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You do not have permission to perform this action",
    );
  });

  it("should reject property creation without images", async () => {
    const token = createAccessToken(seller);

    const response = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Beautiful House in Gampaha")
      .field(
        "description",
        "A beautiful modern house located in a convenient area.",
      )
      .field("propertyType", "house")
      .field("listingType", "sale")
      .field("price", "15000000")
      .field("address", "123 Main Street")
      .field("district", "Gampaha")
      .field("city", "Gampaha")
      .field("bedrooms", "3")
      .field("bathrooms", "2")
      .field("area", "1800");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "At least one property image is required",
    );
  });
});

describe("GET /api/properties", () => {
  it("should return approved properties", async () => {
    await createTestProperty(seller._id);

    await createTestProperty(seller._id, {
      title: "Another Approved Property",
    });

    await createTestProperty(seller._id, {
      title: "Pending Property",
      status: "pending",
    });

    const response = await request(app).get("/api/properties");

    expect(response.status).toBe(200);
    expect(response.body.properties).toBeDefined();
    expect(response.body.properties.length).toBe(2);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.totalProperties).toBe(2);
  });

  it("should filter properties by district", async () => {
    await createTestProperty(seller._id);

    await createTestProperty(seller._id, {
      title: "House in Kandy",
      location: {
        address: "Kandy Road",
        district: "Kandy",
        city: "Kandy",
      },
    });

    const response = await request(app).get("/api/properties").query({
      district: "Kandy",
    });

    expect(response.status).toBe(200);
    expect(response.body.properties.length).toBe(1);
    expect(response.body.properties[0].location.district).toBe("Kandy");
  });

  it("should return cached property results", async () => {
    await createTestProperty(seller._id);

    const firstResponse = await request(app).get("/api/properties");

    expect(firstResponse.status).toBe(200);

    const secondResponse = await request(app).get("/api/properties");

    expect(secondResponse.status).toBe(200);

    expect(secondResponse.body.properties.length).toBe(
      firstResponse.body.properties.length,
    );
  });
});

describe("GET /api/properties/:id", () => {
  it("should return an approved property by ID", async () => {
    const property = await createTestProperty(seller._id);

    const response = await request(app).get(`/api/properties/${property._id}`);

    expect(response.status).toBe(200);
    expect(response.body.property).toBeDefined();

    expect(response.body.property._id).toBe(property._id.toString());

    expect(response.body.property.title).toBe("Beautiful House in Colombo");
  });

  it("should reject an invalid property ID", async () => {
    const response = await request(app).get("/api/properties/invalid-id");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid property ID");
  });

  it("should return 404 when property does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/properties/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Property not found");
  });
});

describe("GET /api/properties/my-properties", () => {
  it("should return the logged-in seller's properties", async () => {
    await createTestProperty(seller._id);

    await createTestProperty(seller._id, {
      title: "Second Seller Property",
    });

    await createTestProperty(anotherSeller._id, {
      title: "Other Seller Property",
    });

    const token = createAccessToken(seller);

    const response = await request(app)
      .get("/api/properties/my-properties")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.properties).toBeDefined();
    expect(response.body.properties.length).toBe(2);

    response.body.properties.forEach((property) => {
      expect(property.seller.toString()).toBe(seller._id.toString());
    });
  });

  it("should reject a buyer accessing seller properties", async () => {
    const token = createAccessToken(buyer);

    const response = await request(app)
      .get("/api/properties/my-properties")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("should reject unauthenticated access", async () => {
    const response = await request(app).get("/api/properties/my-properties");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });
});

describe("PATCH /api/properties/:id", () => {
  it("should update the seller's own property", async () => {
    const property = await createTestProperty(seller._id);

    const token = createAccessToken(seller);

    const response = await request(app)
      .patch(`/api/properties/${property._id}`)
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Updated Beautiful House")
      .field("description", "This is an updated description for the property.")
      .field("price", "30000000")
      .field("existingImages", JSON.stringify(property.images));

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Property updated successfully");
    expect(response.body.property.title).toBe("Updated Beautiful House");
    expect(response.body.property.price).toBe(30000000);

    const updatedProperty = await Property.findById(property._id);

    expect(updatedProperty.title).toBe("Updated Beautiful House");
    expect(updatedProperty.price).toBe(30000000);
  });

  it("should not allow a seller to update another seller's property", async () => {
    const property = await createTestProperty(anotherSeller._id);

    const token = createAccessToken(seller);

    const response = await request(app)
      .patch(`/api/properties/${property._id}`)
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Hacked Property Title");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Property not found");
  });

  it("should reject updating an invalid property ID", async () => {
    const token = createAccessToken(seller);

    const response = await request(app)
      .patch("/api/properties/invalid-id")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Updated Property");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid property ID");
  });
});

describe("DELETE /api/properties/:id", () => {
  it("should delete the seller's own property", async () => {
    const property = await createTestProperty(seller._id);

    const token = createAccessToken(seller);

    const response = await request(app)
      .delete(`/api/properties/${property._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Property deleted successfully");

    const deletedProperty = await Property.findById(property._id);

    expect(deletedProperty).toBeNull();
  });

  it("should not allow a seller to delete another seller's property", async () => {
    const property = await createTestProperty(anotherSeller._id);

    const token = createAccessToken(seller);

    const response = await request(app)
      .delete(`/api/properties/${property._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Property not found");
  });

  it("should reject deleting a sold property", async () => {
    const property = await createTestProperty(seller._id, {
      status: "sold",
    });

    const token = createAccessToken(seller);

    const response = await request(app)
      .delete(`/api/properties/${property._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Sold properties cannot be deleted");
  });
});

describe("PATCH /api/properties/:id/sold", () => {
  it("should mark an approved property as sold", async () => {
    const property = await createTestProperty(seller._id);

    const token = createAccessToken(seller);

    const response = await request(app)
      .patch(`/api/properties/${property._id}/sold`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe("Property marked as sold successfully");

    expect(response.body.property.status).toBe("sold");

    const updatedProperty = await Property.findById(property._id);

    expect(updatedProperty.status).toBe("sold");
  });

  it("should not mark a pending property as sold", async () => {
    const property = await createTestProperty(seller._id, {
      status: "pending",
    });

    const token = createAccessToken(seller);

    const response = await request(app)
      .patch(`/api/properties/${property._id}/sold`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Only approved properties can be marked as sold",
    );
  });

  it("should not allow a seller to mark another seller's property as sold", async () => {
    const property = await createTestProperty(anotherSeller._id);

    const token = createAccessToken(seller);

    const response = await request(app)
      .patch(`/api/properties/${property._id}/sold`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body.message).toBe("Property not found");
  });
});
