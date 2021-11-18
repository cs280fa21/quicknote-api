const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../server");
const UserDao = require("../../server/data/UserDao");

const users = new UserDao();
const request = supertest(app);

describe("Test authentication endpoints", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    await users.create({
      username: "testclient",
      password: "testclient",
      role: "CLIENT",
    });
  });

  describe("Test /authenticate", () => {
    test("Return 400 when username is missing", async () => {
      const response = await request.post("/authenticate").send({
        password: "testclient",
      });
      expect(response.status).toBe(400);
    });

    test("Return 400 when password is missing", async () => {
      const response = await request.post("/authenticate").send({
        username: "testclient",
      });
      expect(response.status).toBe(400);
    });

    test("Return 403 when username is incorrect", async () => {
      const response = await request.post("/authenticate").send({
        username: "client",
        password: "testclient",
      });
      expect(response.status).toBe(403);
    });

    test("Return 403 when password is incorrect", async () => {
      const response = await request.post("/authenticate").send({
        username: "testclient",
        password: "client",
      });
      expect(response.status).toBe(403);
    });

    test("Return 200 when authentication is sucessfull", async () => {
      const response = await request.post("/authenticate").send({
        username: "testclient",
        password: "testclient",
      });
      expect(response.status).toBe(200);
    });

    test("Return a JWT when authentication is sucessfull", async () => {
      const response = await request.post("/authenticate").send({
        username: "testclient",
        password: "testclient",
      });
      expect(response.body.token).toBeTruthy(); // exists and non empty!
    });
  });

  describe("Test /register", () => {
    test("Return 400 when username is missing", async () => {
      const response = await request.post("/register").send({
        password: "newtestclient",
      });
      expect(response.status).toBe(400);
    });

    test("Return 400 when password is missing", async () => {
      const response = await request.post("/register").send({
        username: "newtestclient",
      });
      expect(response.status).toBe(400);
    });

    test("Return 500 when username already exist", async () => {
      const response = await request.post("/register").send({
        username: "testclient",
        password: "testclient",
      });
      expect(response.status).toBe(500);
    });

    test("Return 201 when registeration is sucessfull", async () => {
      const response = await request.post("/register").send({
        username: "newtestclient",
        password: "newtestclient",
      });
      expect(response.status).toBe(201);
    });

    test("Return a JWT when registeration is sucessfull", async () => {
      const response = await request.post("/register").send({
        username: "anothernewtestclient",
        password: "anothernewtestclient",
      });
      expect(response.body.token).toBeTruthy(); // exists and non empty!
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
