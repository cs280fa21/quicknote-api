const faker = require("faker");
const db = require("../server/data/db");
const NoteDao = require("../server/data/NoteDao");

async function createSameplNotes() {
  try {
    await db.connect();

    const notes = new NoteDao();
    const note = await notes.create({
      title: faker.lorem.sentence(),
      text: faker.lorem.paragraph(),
    });
    console.log(note);
  } catch (err) {
    console.log(err);
  }
}

createSameplNotes();
