const Note = require("../model/Note");

class NoteDao {
  constructor() {
    this.notes = [];
  }

  async create(title, text) {}

  async update(id, { title, text }) {}

  async delete(id) {}

  async read(id) {}

  async readAll(query = "") {}
}

module.exports = NoteDao;
