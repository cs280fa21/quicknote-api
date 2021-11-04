const Note = require("../model/Note");
const ApiError = require("../model/ApiError");

class NoteDao {
  constructor() {
    this.notes = [];
  }

  async create({ title, text }) {
    if (title === undefined || title === "") {
      throw new ApiError(400, "Every note must have a none-empty title!");
    }

    if (text === undefined) {
      throw new ApiError(400, "Every note must have a text attribute!");
    }

    const note = new Note(title, text);
    this.notes.push(note);
    return note;
  }

  async update(id, { title, text }) {
    const index = this.notes.findIndex((note) => note._id === id);

    if (index === -1) {
      throw new ApiError(404, "There is no note with the given ID!");
    }

    if (title !== undefined) {
      this.notes[index].title = title;
    }

    if (text !== undefined) {
      this.notes[index].text = text;
    }

    return this.notes[index];
  }

  async delete(id) {
    const index = this.notes.findIndex((note) => note._id === id);

    if (index === -1) {
      throw new ApiError(404, "There is no note with the given ID!");
    }

    const note = this.notes[index];
    this.notes.splice(index, 1);
    return note;
  }

  // returns an empty array if there is no note with the given ID
  async read(id) {
    return this.notes.find((note) => note._id === id);
  }

  // returns an empty array if there is no note in the database
  //  or no note matches the search query
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
