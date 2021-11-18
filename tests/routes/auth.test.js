const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../server");
const UserDao = require("../../server/data/UserDao");

const users = new UserDao();
const request = supertest(app);

describe("Test authentication endpoints", () => {
  describe("Test /authenticate", () => {
    beforeAll(async () => {
      await mongoose.connect(global.__MONGO_URI__);
      await users.create({
        username: "testclient",
        password: "testclient",
        role: "CLIENT",
      });
    });

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

    afterAll(async () => {
      await mongoose.connection.close();
    });
  });
});
