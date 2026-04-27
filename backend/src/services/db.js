"use strict";

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Resolve database path to <project_root>/data/km_nav.sqlite
const dbPath = path.resolve(__dirname, "../../data/km_nav.sqlite");

// Ensure the parent directory exists
const dir = path.dirname(dbPath);
fs.mkdirSync(dir, { recursive: true });

// Open database synchronously
const db = new Database(dbPath);

// Performance and integrity pragmas
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create users table if it does not already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// Create route_history table and index if they do not already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS route_history (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL,
    start_node       TEXT    NOT NULL,
    destination_node TEXT    NOT NULL,
    preference       TEXT    NOT NULL DEFAULT 'none',
    result_json      TEXT    NOT NULL,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_route_history_user_created
    ON route_history (user_id, created_at DESC);
`);

module.exports = db;
