require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects/:projectId/tasks', require('./routes/tasks'));
app.use('/api/projects/:projectId/chat', require('./routes/chat'));
app.use('/api/projects/:projectId/sprints', require('./routes/sprints'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'ProjectFlow API v2', timestamp: new Date().toISOString() }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try { await testConnection(); } catch (err) { console.error('❌ Cannot connect to MySQL:', err.message); process.exit(1); }
  const server = app.listen(PORT, () => console.log(`🚀 ProjectFlow API running on http://localhost:${PORT}`));
  server.on('error', (err) => { if (err.code === 'EADDRINUSE') { console.error(`❌ Port ${PORT} in use. Run: taskkill /IM node.exe /F`); process.exit(1); } });
};

start();
