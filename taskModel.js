// models/taskModel.js
// Same principles as userModel.js: parameterized queries throughout.

const db = require('../db');

function createTask({ user_id, title, description, status }) {
  const stmt = db.prepare(`
    INSERT INTO tasks (user_id, title, description, status)
    VALUES (?, ?, ?, COALESCE(?, 'pending'))
  `);
  const info = stmt.run(user_id, title, description ?? null, status ?? null);
  return getTaskById(info.lastInsertRowid);
}

function getAllTasks() {
  return db.prepare('SELECT * FROM tasks ORDER BY id').all();
}

function getTaskById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

function getTasksByUserId(user_id) {
  return db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY id').all(user_id);
}

function updateTask(id, { title, description, status }) {
  const existing = getTaskById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(
    title ?? existing.title,
    description ?? existing.description,
    status ?? existing.status,
    id
  );
  return getTaskById(id);
}

function deleteTask(id) {
  const existing = getTaskById(id);
  if (!existing) return false;
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return true;
}

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByUserId,
  updateTask,
  deleteTask,
};
