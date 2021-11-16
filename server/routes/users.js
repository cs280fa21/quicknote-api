const express = require("express");
const UserDao = require("../data/UserDao");
const { verifyToken, decodeToken } = require("../util/token");

const router = express.Router();
const users = new UserDao();

router.get("/api/users", async (req, res) => {
  const { authorization } = req.headers;
  const [_, token] = authorization.trim().split(" ");
  const valid = await verifyToken(token);
  const user = decodeToken(token);
  if (!valid || user.role !== "ADMIN") {
    return res.status(403).json({
      message:
        "You are not authorized to access this resource.",
    });
  }
  
  const { username, role } = req.query;
  if (username && role) {
    res.status(400).json({
      message:
        "You must query the database based on either a username or user role.",
    });
  } else {
    const data = username
      ? await users.readOne(username)
      : await users.readAll(role);
    res.json({ data: data ? data : [] });
  }
});

router.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const data = await users.read(id);
  res.json({ data: data ? data : [] });
});

router.post("/api/users", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const data = await users.create({ username, password, role });
    res.status(201).json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

router.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await users.delete(id);
    res.json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

router.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password, role } = req.body;
    const data = await users.update(id, { password, role });
    res.json({ data });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
});

module.exports = router;
