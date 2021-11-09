const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
});

const Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
