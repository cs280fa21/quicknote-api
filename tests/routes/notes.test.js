const faker = require("faker");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../server");
const UserDao = require("../../server/data/UserDao");
const NoteDao = require("../../server/data/NoteDao");
const { createToken } = require("../../server/util/token");

const users = new UserDao();
const notes = new NoteDao();
const request = supertest(app);

const endpoint = "/api/notes";

describe(`Test ${endpoint} endpoints`, () => {
  const tokens = {};
  const clients = [];

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);

    clients[0] = await users.create({
      username: "client1",
      password: "client1",
      role: "CLIENT",
    });

    clients[1] = await users.create({
      username: "client2",
      password: "client2",
      role: "CLIENT",
    });

    clients[2] = await users.create({
      username: "admin",
      password: "admin",
      role: "ADMIN",
    });

    tokens.admin = await createToken(clients[2]);
    tokens.invalid = tokens.admin
      .split("")
      .sort(function () {
        return 0.5 - Math.random();
      })
      .join("");
    tokens.client = await createToken(clients[0]);
    tokens.expiredAdmin = await createToken(clients[2], -1);
  });

  describe(`Test GET ${endpoint}`, () => {
    const samples = [];

    beforeAll(async () => {
      samples[0] = await notes.create({
        title: "known title for search query!",
        text: faker.lorem.paragraph(),
        author: clients[0]._id,
      });

      samples[1] = await notes.create({
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        author: clients[0]._id,
      });

      samples[2] = await notes.create({
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        author: clients[1]._id,
      });
    });

    test("Return 403 for missing token", async () => {
      const response = await request.get(endpoint);
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for expired token", async () => {
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    test("Return 200 and list of notes for successful request", async () => {
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(200);
      const expected = samples.filter(
        (s) => s.author === clients[0]._id
      ).length;
      expect(response.body.data.length).toBe(expected);
    });

    describe(`Test GET ${endpoint} with query parameter`, () => {
      test("Return 200 and list of notes for successful request", async () => {
        const query = samples[0].title;
        const response = await request
          .get(`${endpoint}?query=${query}`)
          .set("Authorization", `Bearer ${tokens.client}`);
        expect(response.status).toBe(200);
        const expected = samples.filter((s) => s.title.includes(query)).length;
        expect(response.body.data.length).toBe(expected);
      });
    });

    afterAll(async () => {
      for (const sample of samples) {
        await notes.delete(sample.author, sample._id);
      }
    });
  });

  describe(`Test GET ${endpoint}/:id`, () => {
    let sample;

    beforeAll(async () => {
      sample = await notes.create({
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        author: clients[0]._id,
      });
    });

    test("Return 404 for an invalid id", async () => {
      const id = mongoose.Types.ObjectId().toString();
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(404);
    });

    test("Return 403 for missing token", async () => {
      const id = sample._id;
      const response = await request.get(`${endpoint}/${id}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      const id = sample._id;
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for unauthorized token", async () => {
      const id = sample._id;
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.admin}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for expired token", async () => {
      const id = sample._id;
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    test("Return 200 and the user for a given id", async () => {
      const id = sample._id;
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(200);
      expect(response.body.data).toStrictEqual(sample);
    });

    afterAll(async () => {
      await notes.delete(sample.author, sample._id);
    });
  });

  describe(`Test POST ${endpoint}`, () => {
    let sample;

    beforeAll(async () => {
      sample = {
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
      };
    });

    test("Return 403 for missing token", async () => {
      const response = await request.post(endpoint).send(sample);
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      const response = await request
        .post(endpoint)
        .send(sample)
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for expired token", async () => {
      const response = await request
        .post(endpoint)
        .send(sample)
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    test("Return 400 for missing payload", async () => {
      const response = await request
        .post(endpoint)
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(400);
    });

    test("Return 400 for missing title", async () => {
      const response = await request
        .post(endpoint)
        .send({
          text: faker.lorem.paragraph(),
        })
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(400);
    });

    test("Return 400 for missing text", async () => {
      const response = await request
        .post(endpoint)
        .send({
          title: faker.lorem.paragraph(),
        })
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(400);
    });

    test("Return 201 and the user for successful request", async () => {
      const response = await request
        .post(endpoint)
        .send(sample)
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(sample.title);
      expect(response.body.data.text).toBe(sample.text);
      sample._id = response.body.data._id;
      sample.author = response.body.data.author;
    });

    afterAll(async () => {
      await notes.delete(sample.author, sample._id);
    });
  });

  describe(`Test PUT ${endpoint}/:id`, () => {
    let sample;

    beforeAll(async () => {
      sample = await notes.create({
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        author: clients[0]._id,
      });
    });

    test("Return 404 for invalid ID", async () => {
      const id = mongoose.Types.ObjectId().toString();
      const response = await request
        .put(`${endpoint}/${id}`)
        .send({
          title: faker.lorem.sentence(),
        })
        .set("Authorization", `Bearer ${tokens.admin}`);
      expect(response.status).toBe(404);
    });

    test("Return 403 for missing token", async () => {
      const response = await request.put(`${endpoint}/${sample._id}`).send({
        title: faker.lorem.sentence(),
      });
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      const response = await request
        .put(`${endpoint}/${sample._id}`)
        .send({
          title: faker.lorem.sentence(),
        })
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for unauthorized token", async () => {
      const response = await request
        .put(`${endpoint}/${sample._id}`)
        .send({
          title: faker.lorem.sentence(),
        })
        .set("Authorization", `Bearer ${tokens.admin}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for expired token", async () => {
      const response = await request
        .put(`${endpoint}/${sample._id}`)
        .send({
          title: faker.lorem.sentence(),
        })
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    test("Return 400 for missing payload", async () => {
      const response = await request
        .put(`${endpoint}/${sample._id}`)
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(400);
    });

    test("Return 200 and updated user for successful request", async () => {
      const response = await request
        .put(`${endpoint}/${sample._id}`)
        .send({
          title: faker.lorem.sentence(),
        })
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(200);
    });

    afterAll(async () => {
      await notes.delete(sample.author, sample._id);
    });
  });

  describe(`Test DELETE ${endpoint}/:id`, () => {
    let sample;

    beforeAll(async () => {
      sample = await notes.create({
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        author: clients[0]._id,
      });
    });

    test("Return 404 for invalid ID", async () => {
      const id = mongoose.Types.ObjectId().toString();
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.admin}`);
      expect(response.status).toBe(404);
    });

    test("Return 403 for missing token", async () => {
      const response = await request.delete(`${endpoint}/${sample._id}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      const response = await request
        .delete(`${endpoint}/${sample._id}`)
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for unauthorized token", async () => {
      const response = await request
        .delete(`${endpoint}/${sample._id}`)
        .set("Authorization", `Bearer ${tokens.admin}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for expired token", async () => {
      const response = await request
        .delete(`${endpoint}/${sample._id}`)
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    test("Return 200 and deleted user for successful request", async () => {
      const response = await request
        .delete(`${endpoint}/${sample._id}`)
        .set("Authorization", `Bearer ${tokens.client}`);
      expect(response.status).toBe(200);
      expect(response.body.data).toStrictEqual(sample);
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });
});
