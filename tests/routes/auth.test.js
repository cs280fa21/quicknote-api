const supertest = require("supertest");
const app = require("../../server");

const request = supertest(app);

describe("Test authentication endpoints", () => {

  describe("Test /authenticate", () => {
    test("Return 400 when username is missing", async () => {
      
    });

    test("Return 400 when password is missing", async () => {
      
    });

    test("Return 403 when username is incorrect", async () => {
      
    });

    test("Return 403 when password is incorrect", async () => {
      
    });

    test("Return 200 when authentication is sucessfull", async () => {

    });

    test("Return a JWT when authentication is sucessfull", async () => {

    });
  });
});