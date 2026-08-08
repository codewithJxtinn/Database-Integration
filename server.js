const express = require('express');
require('./db'); // initializes schema on startup

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Project 3: Database Integration API',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
    },
  });
});

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
