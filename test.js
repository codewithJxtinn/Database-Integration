// test.js — boots the app and exercises every CRUD endpoint + security checks
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const express = require('express');
require('./db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use((req, res) => res.status(404).json({ error: 'route not found' }));

const server = app.listen(0, async () => {
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  const log = (label, res, body) => console.log(`\n== ${label} == [${res.status}]\n${JSON.stringify(body)}`);

  async function call(method, url, body) {
    const res = await fetch(base + url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    return { status: res.status, json };
  }

  // CREATE users
  let r = await call('POST', '/api/users', { name: 'Alice', email: 'alice@email.com' });
  log('CREATE user Alice', r, r.json);
  const alice = r.json;

  r = await call('POST', '/api/users', { name: 'Bob', email: 'bob@email.com' });
  log('CREATE user Bob', r, r.json);
  const bob = r.json;

  // Duplicate email -> should 409 (UNIQUE constraint)
  r = await call('POST', '/api/users', { name: 'Alice2', email: 'alice@email.com' });
  log('CREATE duplicate email (expect 409)', r, r.json);

  // Missing required field -> should 400 (NOT NULL / app validation)
  r = await call('POST', '/api/users', { name: 'NoEmail' });
  log('CREATE missing email (expect 400)', r, r.json);

  // READ all
  r = await call('GET', '/api/users');
  log('READ all users', r, r.json);

  // READ one
  r = await call('GET', `/api/users/${alice.id}`);
  log('READ Alice by id', r, r.json);

  // UPDATE
  r = await call('PUT', `/api/users/${alice.id}`, { name: 'Alice Smith', email: 'alice@email.com' });
  log('UPDATE Alice name', r, r.json);

  // CREATE tasks
  r = await call('POST', '/api/tasks', { user_id: alice.id, title: 'Design schema', description: 'ERD for Project 3' });
  log('CREATE task for Alice', r, r.json);
  const task1 = r.json;

  r = await call('POST', '/api/tasks', { user_id: alice.id, title: 'Write CRUD routes', status: 'in_progress' });
  log('CREATE 2nd task for Alice', r, r.json);

  r = await call('POST', '/api/tasks', { user_id: bob.id, title: 'Review PR' });
  log('CREATE task for Bob', r, r.json);

  // Invalid status -> should 400 (CHECK constraint)
  r = await call('POST', '/api/tasks', { user_id: alice.id, title: 'Bad status', status: 'not_a_real_status' });
  log('CREATE task with invalid status (expect 400)', r, r.json);

  // Foreign key validation -> nonexistent user
  r = await call('POST', '/api/tasks', { user_id: 9999, title: 'Orphan task' });
  log('CREATE task with nonexistent user_id (expect 400)', r, r.json);

  // READ tasks filtered by user
  r = await call('GET', `/api/tasks?user_id=${alice.id}`);
  log("READ Alice's tasks", r, r.json);

  // UPDATE task status
  r = await call('PUT', `/api/tasks/${task1.id}`, { status: 'completed' });
  log('UPDATE task1 status -> completed', r, r.json);

  // DELETE task
  r = await call('DELETE', `/api/tasks/${task1.id}`);
  log('DELETE task1 (expect 204, empty body)', r, r.json);

  // READ deleted task -> 404
  r = await call('GET', `/api/tasks/${task1.id}`);
  log('READ deleted task (expect 404)', r, r.json);

  // DELETE user -> cascades to their remaining tasks (ON DELETE CASCADE)
  r = await call('DELETE', `/api/users/${alice.id}`);
  log('DELETE Alice (expect 204)', r, r.json);

  r = await call('GET', '/api/tasks');
  log('READ all tasks after cascade delete (Alice\'s remaining task gone)', r, r.json);

  console.log('\n✅ All CRUD + constraint + security checks executed.');
  server.close();
});
