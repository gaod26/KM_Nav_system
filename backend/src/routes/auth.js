"use strict";

const express = require("express");
const db = require("../services/db");
const { hashPassword, verifyPassword, signToken } = require("../services/auth");

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------
router.post("/register", async (req, res) => {
  const { username, password } = req.body ?? {};

  // --- Field presence / type validation (order matters) ---
  if (username === undefined || username === null || typeof username !== "string" || username === "") {
    return res.status(400).json({ detail: "Missing required field: username" });
  }
  if (password === undefined || password === null || typeof password !== "string") {
    return res.status(400).json({ detail: "Missing required field: password" });
  }

  const trimmedUsername = username.trim();

  // --- Format validation ---
  if (trimmedUsername.length < 3 || trimmedUsername.length > 32) {
    return res.status(400).json({ detail: "Username must be between 3 and 32 characters" });
  }
  if (password.length < 8) {
    return res.status(400).json({ detail: "Password must be at least 8 characters" });
  }

  // --- Uniqueness pre-check ---
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(trimmedUsername);
  if (existing) {
    return res.status(409).json({ detail: "Username already exists" });
  }

  try {
    const passwordHash = await hashPassword(password);

    const result = db
      .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
      .run(trimmedUsername, passwordHash);

    const userId = result.lastInsertRowid;
    const token = signToken({ user_id: userId, username: trimmedUsername });

    return res.status(201).json({
      token,
      user: { id: userId, username: trimmedUsername },
    });
  } catch (err) {
    // Safety-net: catch UNIQUE constraint violation from SQLite
    if (err && err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ detail: "Username already exists" });
    }
    throw err; // bubble up to the 500 handler
  }
});

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  // --- Field presence / type validation only (no length/format checks on login) ---
  if (username === undefined || username === null || typeof username !== "string" || username === "") {
    return res.status(400).json({ detail: "Missing required field: username" });
  }
  if (password === undefined || password === null || typeof password !== "string") {
    return res.status(400).json({ detail: "Missing required field: password" });
  }

  const INVALID = { detail: "Invalid username or password" };

  const user = db
    .prepare("SELECT id, username, password_hash FROM users WHERE username = ?")
    .get(username.trim());

  if (!user) {
    return res.status(401).json(INVALID);
  }

  const match = await verifyPassword(password, user.password_hash);
  if (!match) {
    return res.status(401).json(INVALID);
  }

  const token = signToken({ user_id: user.id, username: user.username });

  return res.status(200).json({
    token,
    user: { id: user.id, username: user.username },
  });
});

module.exports = router;
