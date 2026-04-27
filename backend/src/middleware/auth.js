"use strict";

const { verifyToken } = require("../services/auth");

// ---------------------------------------------------------------------------
// Shared helper — parse and verify the Bearer token from a request.
// Returns { user_id, username } on success, or null on any failure.
// ---------------------------------------------------------------------------
function _extractUser(req) {
  const header = req.headers["authorization"];
  if (!header) return null;

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;

  const token = parts[1];
  return verifyToken(token); // null if invalid/expired
}

// ---------------------------------------------------------------------------
// requireAuth — 401 on any auth problem, otherwise sets req.user and calls next
// ---------------------------------------------------------------------------
function requireAuth(req, res, next) {
  const user = _extractUser(req);
  if (!user) {
    return res.status(401).json({ detail: "Authentication required" });
  }
  req.user = { user_id: user.user_id, username: user.username };
  return next();
}

// ---------------------------------------------------------------------------
// optionalAuth — never 401; sets req.user if token is valid, otherwise skips
// ---------------------------------------------------------------------------
function optionalAuth(req, res, next) {
  const user = _extractUser(req);
  if (user) {
    req.user = { user_id: user.user_id, username: user.username };
  }
  return next();
}

module.exports = { requireAuth, optionalAuth };
