const Note = require("../model/Note");

class NoteDao {
  constructor() {
    this.notes = [];
  }

  // Pre: title and text are not undefined, and title is not empty
  async create({ title, text }) {
    const note = new Note(title, text);
    this.notes.push(note);
    return note;
  }

  // Pre: id is a valid note ID
  async update(id, { title, text }) {
    const index = this.notes.findIndex((note) => note._id === id);

    if (title !== undefined) {
      this.notes[index].title = title;
    }

    if (text !== undefined) {
      this.notes[index].text = text;
    }

    return this.notes[index];
  }

  // Pre: id is a valid note ID
  async delete(id) {
    const index = this.notes.findIndex((note) => note._id === id);
    const note = this.notes[index];
    this.notes.splice(index, 1);
    return note;
  }

  // Pre: id is a valid note ID
  async read(id) {
    return this.notes.find((note) => note._id === id);
  }

  async readAll(query = "") {
    if (query !== "") {
      return this.notes.filter(
        (note) => note.title === query || note.text === query
      );
    }
    return this.notes;
  }
}

module.exports = NoteDao;
