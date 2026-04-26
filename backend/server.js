const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// ✅ Connect to database
connectDB();

// ✅ 1. Helmet — security headers
app.use(helmet());

// ✅ 2. Morgan — request logging
app.use(morgan('dev'));

// ✅ 3. CORS — hardened origin control
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ 4. Body parser
app.use(express.json({ limit: '10kb' }));

// ✅ 5. Global rate limiter — all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: '⚠ Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ✅ 6. Strict auth rate limiter — login/register only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: '⚠ Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/passwords', require('./routes/passwordRoutes'));

// ✅ Health check
app.get('/', (req, res) => {
  res.json({
    status: '🔐 CipherVault API running',
    version: '1.0.0',
    security: 'AES-256 + JWT + bcrypt + Helmet + Rate Limiting'
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// ✅ Handle unknown routes
// ✅ This works with Express 5 + Node 24
app.use((req, res) => {
  res.status(404).json({ message: '⚠ Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔐 Security: Helmet + Rate Limiting + CORS + Morgan active`);
});