const Note = require("../model/Note");
const ApiError = require("../model/ApiError");
const mongoose = require("mongoose");

class NoteDao {
  async create({ title, text, author }) {
    if (title === undefined || title === "") {
      throw new ApiError(400, "Every note must have a none-empty title!");
    }

    if (text === undefined) {
      throw new ApiError(400, "Every note must have a text attribute!");
    }

    if (!author || !mongoose.isValidObjectId(author)) {
      throw new ApiError(400, "Every note must have an author!");
    }

    const note = await Note.create({ title, text, author });
    return {
      _id: note._id.toString(),
      title: note.title,
      text: note.text,
      author: note.author.toString(),
    };
  }

  async update(author, id, { title, text }) {
    await this.read(author, id);
    return Note.findByIdAndUpdate(
      id,
      { title, text },
      { new: true, runValidators: true }
    )
      .lean()
      .select("-__v");
  }

  async delete(author, id) {
    await this.read(author, id);
    return Note.findByIdAndDelete(id).lean().select("-__v");
  }

  async read(author, id) {
    const note = await Note.findById(id).lean().select("-__v");

    if (!author || !mongoose.isValidObjectId(author)) {
      throw new ApiError(500, "Author attribute is invalid or missing!");
    }

    if (note === null) {
      throw new ApiError(404, "There is no note with the given ID!");
    }

    if (note.author.toString() !== author) {
      throw new ApiError(
        403,
        "You are not authorized to access this resource!"
      );
    }

    return note;
  }

  // returns an empty array if there is no note in the database
  //  for the given author or no note matches the search query
  async readAll(author, query = "") {
    if (!author || !mongoose.isValidObjectId(author)) {
      throw new ApiError(500, "Author attribute was is invalid or missing!");
    }

    const notes = await Note.find({ author }).lean().select("-__v");

    if (query !== "") {
      return notes.filter(
        (note) => note.title.includes(query) || note.text.includes(query)
      );
    }

    return notes;
  }
}

module.exports = NoteDao;
