const mongoose = require("mongoose");

// TODO replace <password> with the password for quicknote-admin
const URI = `mongodb+srv://quicknote-admin:<password>@quicknote.ydsfc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

const NoteSchema = new mongoose.Schema({
  title: { type: String },
  text: { type: String },
});
  
const Note = mongoose.model("Note", NoteSchema);

Note.create(
  {
    title: faker.lorem.sentence(),
    text: faker.lorem.paragraph(),
  },
  (err, note) => {
    console.log(err ? err : note);
  }
);