const db = require("./data/db");
const NoteDao = require("./data/NoteDao");
const UserDao = require("./data/UserDao");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

const notes = new NoteDao();
const users = new UserDao();

db.connect(); // no need to await for it due to Mongoose buffering!

app.use(express.json());

app.get("/", (req, res) => {
  res.send("QuickNote API!");
});

app.get("/api/notes", async (req, res) => {
  const { query } = req.query;
  const data = await notes.readAll(query);
  res.json({ data: data ? data : [] });
});

app.get("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const data = await notes.read(id);
  res.json({ data: data ? data : [] });
});

app.post("/api/notes", async (req, res) => {
  try {
    const { title, text } = req.body;
    const data = await notes.create({ title, text });
    res.status(201).json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await notes.delete(id);
    res.json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text } = req.body;
    const data = await notes.update(id, { title, text });
    res.json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  const { username, role } = req.query;
  if (username && role) {
    res
      .status(400)
      .json({
        message:
          "You must query the database based on either a username or user role.",
      });
  } else {
    const data = username
      ? await users.readOne(username)
      : await users.readAll(role);
    res.json({ data: data ? data : [] });
  }
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const data = await users.read(id);
  res.json({ data: data ? data : [] });
});

app.post("/api/users", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const data = await users.create({ username, password, role });
    res.status(201).json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await users.delete(id);
    res.json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password, role } = req.body;
    const data = await users.update(id, { password, role });
    res.json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Express app listening at port: http://localhost:${port}/`);
});
