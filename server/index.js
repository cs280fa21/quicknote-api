require("dotenv").config();
const notes = require("./routes/notes.js");
const users = require("./routes/users.js");
const auth = require("./routes/auth.js");
const { globalErrorHandler } = require("./util/middleware");

const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("QuickNote API!");
});

// routing
app.use(notes);
app.use(users);
app.use(auth);

app.use(globalErrorHandler);

module.exports = app;
