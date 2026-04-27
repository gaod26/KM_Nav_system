"use strict";

const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listUserRoutes } = require("../services/history");

const router = express.Router();

/**
 * GET /history
 * Returns the authenticated user's route history, newest first.
 * Query params: limit (default 50, [1-100]), offset (default 0, >= 0)
 */
router.get("/", requireAuth, (req, res) => {
  // --- Parse and validate limit ---
  let limit = 50;
  if (req.query.limit !== undefined) {
    const parsed = Number(req.query.limit);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      return res
        .status(400)
        .json({ detail: "Invalid limit: must be an integer between 1 and 100" });
    }
    limit = parsed;
  }

  // --- Parse and validate offset ---
  let offset = 0;
  if (req.query.offset !== undefined) {
    const parsed = Number(req.query.offset);
    if (!Number.isInteger(parsed) || parsed < 0) {
      return res
        .status(400)
        .json({ detail: "Invalid offset: must be a non-negative integer" });
    }
    offset = parsed;
  }

  const items = listUserRoutes({ userId: req.user.user_id, limit, offset });
  return res.json(items);
});

module.exports = router;
