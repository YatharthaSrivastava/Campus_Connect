require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { initFirebase } = require('./config/firebase');
const { generalLimiter } = require('./middlewares/rateLimiter');
const initSocketHandlers = require('./sockets/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const studyGroupRoutes = require('./routes/studyGroupRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

// ── Initialize ─────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// Connect to MongoDB (non-blocking, falls back smoothly to in-memory store)
connectDB();

// Initialize Firebase Admin SDK
initFirebase();

// ── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
initSocketHandlers(io);

// ── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ───────────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ── Health & Overview Check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CampusConnect API',
    event: 'Codeblitz 2.0 (HackForge)',
    institution: 'Pranveer Singh Institute of Technology (PSIT)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    allowedDomains: process.env.ALLOWED_DOMAINS || 'psit.ac.in',
    realtime: 'Socket.io active',
  });
});

// ── API Routes (Strictly matching API Reference & Specification) ────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/skills', skillsRoutes);
app.use('/api/v1/study-groups', studyGroupRoutes);
app.use('/api/v1/exchange', exchangeRoutes);
app.use('/api/v1/ratings', ratingRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 CampusConnect API running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server initialized on ws://localhost:${PORT}`);
  console.log(`🎓 Institution: PSIT Kanpur | Team: HACKFORGE`);
  console.log(`🔒 Gated Domains: ${process.env.ALLOWED_DOMAINS || 'psit.ac.in'}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api/v1\n`);
});

module.exports = { app, server, io };
