const express = require("express");
const NoteDao = require("../data/NoteDao");

const router = express.Router();
const notes = new NoteDao();

const checkToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const [_, token] = authorization.trim().split(" ");
  const valid = await verifyToken(token);
  if (!valid) {
    return res.status(403).json({
      message:
        "You are not authorized to access this resource.",
    });
  }
  req.user = decodeToken(token);
  next();
};

router.get("/api/notes", checkToken, async (req, res) => {
  const { query } = req.query;
  const data = await notes.readAll(query);
  res.json({ data: data ? data : [] });
});

router.get("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const data = await notes.read(id);
  res.json({ data: data ? data : [] });
});

router.post("/api/notes", checkToken, async (req, res) => {
  try {
    const { title, text } = req.body;
    const data = await notes.create({ title, text });
    res.status(201).json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

router.delete("/api/notes/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await notes.delete(id);
    res.json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

router.put("/api/notes/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text } = req.body;
    const data = await notes.update(id, { title, text });
    res.json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

module.exports = router;
