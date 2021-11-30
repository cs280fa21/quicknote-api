const express = require("express");
const NoteDao = require("../data/NoteDao");
const ApiError = require("../model/ApiError");
const { verifyToken, parseBearer } = require("../util/token");

const router = express.Router();
const notes = new NoteDao();

const checkToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization ? parseBearer(authorization) : "";
  const valid = await verifyToken(token);
  if (!valid) {
    next(new ApiError(403, "You are not authorized to perform this action."));
  }
  req.user = decodeToken(token);
  next();
};

router.get("/api/notes", checkToken, async (req, res, next) => {
  try {
    const { query } = req.query;
    const data = await notes.readAll(req.user.sub, query);
    res.json({ data: data ? data : [] });
  } catch (err) {
    next(err);
  }
});

router.get("/api/notes/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await notes.read(req.user.sub, id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/api/notes", checkToken, async (req, res) => {
  try {
    const { title, text } = req.body;
    const data = await notes.create({ title, text, author: req.user.sub });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/api/notes/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await notes.delete(req.user.sub, id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.put("/api/notes/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text } = req.body;
    const data = await notes.update(req.user.sub, id, { title, text });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
