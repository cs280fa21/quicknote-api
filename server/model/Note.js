const { v4: uuidv4 } = require("uuid");

class Note {
  constructor(title, text) {
    this._id = uuidv4();
    this.title = title;
    this.text = text;
  }
}

module.exports = Note;
