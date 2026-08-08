// models/userModel.js
// ------------------------------------------------------------------
// PILLAR 3: The Action -> CRUD operations
// PILLAR 4: The Shield  -> Every query below uses PARAMETERIZED
//           placeholders (?) instead of string concatenation, so raw
//           user input is NEVER interpreted as executable SQL logic.
//           This is the standard defense against SQL Injection.
// ------------------------------------------------------------------

const db = require('../db');

function createUser({ name, email }) {
  const stmt = db.prepare(
    'INSERT INTO users (name, email) VALUES (?, ?)'
  );
  const info = stmt.run(name, email);
  return getUserById(info.lastInsertRowid);
}

function getAllUsers() {
  return db.prepare('SELECT * FROM users ORDER BY id').all();
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function updateUser(id, { name, email }) {
  const existing = getUserById(id);
  if (!existing) return null;

  const stmt = db.prepare(
    'UPDATE users SET name = ?, email = ? WHERE id = ?'
  );
  stmt.run(name ?? existing.name, email ?? existing.email, id);
  return getUserById(id);
}

function deleteUser(id) {
  const existing = getUserById(id);
  if (!existing) return false;
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return true;
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
