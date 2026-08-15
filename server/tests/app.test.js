import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

import app from "../app.js";

import { connectTestDB, disconnectTestDB } from "./setup.js";

// ============================================================
// TEST DATABASE
// ============================================================

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ============================================================
// API TESTS
// ============================================================

describe("EstateLanka API", () => {
  it("should return the API running message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      message: "EstateLanka API is running",
    });
  });
});
