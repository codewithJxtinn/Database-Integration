// routes/taskRoutes.js

const express = require('express');
const router = express.Router();
const taskModel = require('../models/taskModel');
const userModel = require('../models/userModel');

// CREATE -> POST /api/tasks
router.post('/', (req, res) => {
  const { user_id, title, description, status } = req.body;
  if (!user_id || !title) {
    return res.status(400).json({ error: 'user_id and title are required' });
  }
  if (!userModel.getUserById(user_id)) {
    return res.status(400).json({ error: 'user_id does not reference an existing user' });
  }
  try {
    const task = taskModel.createTask({ user_id, title, description, status });
    res.status(201).json(task);
  } catch (err) {
    if (String(err.message).includes('CHECK')) {
      return res.status(400).json({ error: 'status must be pending, in_progress, or completed' });
    }
    res.status(500).json({ error: 'internal server error' });
  }
});

// READ (all, optionally filter by user) -> GET /api/tasks?user_id=1
router.get('/', (req, res) => {
  const { user_id } = req.query;
  if (user_id) {
    return res.json(taskModel.getTasksByUserId(user_id));
  }
  res.json(taskModel.getAllTasks());
});

// READ (one) -> GET /api/tasks/:id
router.get('/:id', (req, res) => {
  const task = taskModel.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'task not found' });
  res.json(task);
});

// UPDATE -> PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  try {
    const updated = taskModel.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'task not found' });
    res.json(updated);
  } catch (err) {
    if (String(err.message).includes('CHECK')) {
      return res.status(400).json({ error: 'status must be pending, in_progress, or completed' });
    }
    res.status(500).json({ error: 'internal server error' });
  }
});

// DELETE -> DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const ok = taskModel.deleteTask(req.params.id);
  if (!ok) return res.status(404).json({ error: 'task not found' });
  res.status(204).send();
});

module.exports = router;
