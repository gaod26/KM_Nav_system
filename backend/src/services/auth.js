"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------------------------------------------------------------------------
// JWT secret resolution — warn once at module load if falling back to dev key
// ---------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn(
    "[auth] WARNING: JWT_SECRET env var is not set. " +
    "Using the insecure dev-only fallback secret. " +
    "Set JWT_SECRET before deploying to production."
  );
  return "dev-secret-change-in-production";
})();

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------

/**
 * Hash a plaintext password with bcrypt (cost factor 10).
 * @param {string} plain
 * @returns {Promise<string>} bcrypt hash
 */
function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

/**
 * Sign a JWT with HS256.
 * Payload shape expected: { user_id, username }
 * @param {{ user_id: number, username: string }} payload
 * @returns {string} signed token
 */
function signToken(payload) {
  return jwt.sign(
    { user_id: payload.user_id, username: payload.username },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "7d" }
  );
}

/**
 * Verify a JWT and return its decoded payload, or null on any error.
 * @param {string} token
 * @returns {{ user_id: number, username: string } | null}
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
