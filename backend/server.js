require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const knex = require('knex')(require('./knexfile').development);
const openaiService = require('./services/openaiService');

// Import routes
const formRoutes = require('./routes/forms');
const responseRoutes = require('./routes/responses');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// Add knex to request object
app.use((req, res, next) => {
  req.db = knex;
  next();
});

// Initialize OpenAI service
openaiService.initialize().catch(err => {
  console.error('Failed to initialize OpenAI service:', err);
});

// Mount routes - make sure these come BEFORE the 404 handler
app.use('/api/forms', formRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/chat', chatRouter);  // Ensure this is before the 404 handler

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler - this should come AFTER all routes
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.originalUrl, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});