require("dotenv").config();
const notes = require("./routes/notes.js");
const users = require("./routes/users.js");
const auth = require("./routes/auth.js");

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

// Global error handler!
app.use((err, req, res, next) => {
  if (err) {
    // debug(err);
    return res
      .status(err.status || 500)
      .json({message: err.message || "Internal server error!"});
  }
  next();
});

module.exports = app;
