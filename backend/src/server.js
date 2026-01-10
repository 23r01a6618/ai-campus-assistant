require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(globalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Campus AI Backend running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
});

module.exports = app;
