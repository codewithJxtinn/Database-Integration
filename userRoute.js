// routes/userRoutes.js
// Mapping: CREATE=POST, READ=GET, UPDATE=PUT, DELETE=DELETE

const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

// CREATE  -> POST /api/users
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  try {
    const user = userModel.createUser({ name, email });
    res.status(201).json(user);
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    res.status(500).json({ error: 'internal server error' });
  }
});

// READ (all) -> GET /api/users
router.get('/', (req, res) => {
  res.json(userModel.getAllUsers());
});

// READ (one) -> GET /api/users/:id
router.get('/:id', (req, res) => {
  const user = userModel.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user);
});

// UPDATE -> PUT /api/users/:id
router.put('/:id', (req, res) => {
  try {
    const updated = userModel.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'user not found' });
    res.json(updated);
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    res.status(500).json({ error: 'internal server error' });
  }
});

// DELETE -> DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  const ok = userModel.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: 'user not found' });
  res.status(204).send();
});

module.exports = router;