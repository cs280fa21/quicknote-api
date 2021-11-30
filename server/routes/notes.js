const express = require("express");
const NoteDao = require("../data/NoteDao");
const ApiError = require("../model/ApiError");
const { checkToken } = require("../util/middleware");

const router = express.Router();
const notes = new NoteDao();

router.get("/api/notes", checkToken, async (req, res, next) => {
  try {
    const { query } = req.query;
    const data = await notes.readAll(req.user.sub, query);
    res.json({ data: data ? data : [] });
  } catch (err) {
    next(err);
  }
});

router.get("/api/notes/:id", checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await notes.read(req.user.sub, id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/api/notes", checkToken, async (req, res, next) => {
  try {
    const { title, text } = req.body;
    const data = await notes.create({ title, text, author: req.user.sub });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/api/notes/:id", checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await notes.delete(req.user.sub, id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.put("/api/notes/:id", checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, text } = req.body;
    if (!title && !text) {
      throw new ApiError(400, "You must provide at least one note attribute!");
    }
    const data = await notes.update(req.user.sub, id, { title, text });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
