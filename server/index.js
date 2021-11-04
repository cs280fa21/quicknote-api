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

app.get("/", (req, res) => {
  res.send("QuickNote API!");
});

app.listen(port, () => {
  console.log(`Express app listening at port: http://localhost:${port}/`);
});
