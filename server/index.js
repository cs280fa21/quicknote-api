const faker = require("faker");
const NoteDao = require("./data/NoteDao");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

const NUM_SAMPLES = 3;
const notes = new NoteDao();
for (let i = 0; i < NUM_SAMPLES; i++) {
  notes.create({
    title: faker.lorem.sentence(),
    text: faker.lorem.paragraph(),
  });
}

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

app.listen(port, () => {
  console.log(`Express app listening at port: http://localhost:${port}/`);
});
