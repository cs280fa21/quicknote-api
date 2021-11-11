const db = require("./data/db");
const notes = require("./routes/notes.js");
const users = require("./routes/users.js");
const auth = require("./routes/auth.js");

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

db.connect(); // no need to await for it due to Mongoose buffering!

app.use(express.json());

app.get("/", (req, res) => {
  res.send("QuickNote API!");
});

// routing
app.use(notes);
app.use(users);
app.use(auth);

app.listen(port, () => {
  console.log(`Express app listening at port: http://localhost:${port}/`);
});
