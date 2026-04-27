"use strict";

const db = require("./db");

// ---------------------------------------------------------------------------
// Prepared statements — compiled once at module load, reused on every call
// ---------------------------------------------------------------------------
const stmtInsert = db.prepare(
  `INSERT INTO route_history (user_id, start_node, destination_node, preference, result_json)
   VALUES (@userId, @start, @destination, @preference, @result_json)`
);

const stmtList = db.prepare(
  `SELECT id, start_node, destination_node, preference, created_at, result_json
   FROM route_history
   WHERE user_id = ?
   ORDER BY created_at DESC, id DESC
   LIMIT ? OFFSET ?`
);

// ---------------------------------------------------------------------------
// saveRoute({ userId, start, destination, preference, result })
// Inserts a row and returns the new row's id. Throws on DB error.
// ---------------------------------------------------------------------------
function saveRoute({ userId, start, destination, preference, result }) {
  const info = stmtInsert.run({
    userId,
    start,
    destination,
    preference,
    result_json: JSON.stringify(result),
  });
  return info.lastInsertRowid;
}

// ---------------------------------------------------------------------------
// listUserRoutes({ userId, limit, offset })
// Returns an array of { id, start_node, destination_node, preference, created_at, result }
// ---------------------------------------------------------------------------
function listUserRoutes({ userId, limit, offset }) {
  const rows = stmtList.all(userId, limit, offset);
  return rows.map((row) => ({
    id: row.id,
    start_node: row.start_node,
    destination_node: row.destination_node,
    preference: row.preference,
    created_at: row.created_at,
    result: JSON.parse(row.result_json),
  }));
}

module.exports = { saveRoute, listUserRoutes };
