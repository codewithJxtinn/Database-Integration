// db.js
// ------------------------------------------------------------------
// PILLAR 1: The Blueprint  -> Schema & Design
// PILLAR 2: The Bridge     -> Integration & Connection
// ------------------------------------------------------------------
// We use Node's built-in `node:sqlite` module as our "native driver"
// bridge between application code and permanent storage. SQLite keeps
// the whole database in a single file (data.db) — no external server
// to install, but the same schema/CRUD/security principles apply to
// PostgreSQL, MySQL, or any other relational database.
// ------------------------------------------------------------------

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.db');
const db = new DatabaseSync(DB_PATH);

// Enforce referential integrity (foreign keys are OFF by default in SQLite)
db.exec('PRAGMA foreign_keys = ON;');

// ------------------------------------------------------------------
// SCHEMA DESIGN
//
// users (1) ----< (many) tasks
//
// One-to-Many relationship: a single user can own many tasks.
// This demonstrates Primary Keys, Foreign Keys, and data-integrity
// constraints (UNIQUE, NOT NULL, CHECK) — PILLAR 4: The Shield.
// ------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    title       TEXT    NOT NULL,
    description TEXT,
    status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

module.exports = db;
