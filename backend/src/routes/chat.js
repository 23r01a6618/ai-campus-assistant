const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');
const { chatLimiter } = require('../utils/rateLimiter');
const verifyToken = require('../middleware/auth');

/**
 * POST /api/chat
 * Send a message and get AI response
 * Body: { message: string }
 * Optional: Firebase token in Authorization header for per-user rate limiting
 */
router.post('/', chatLimiter, async (req, res, next) => {
  // Try to verify token for rate limiting, but don't require it
  if (req.headers.authorization) {
    try {
      await verifyToken(req, res, () => {});
    } catch (error) {
      // Continue without user info
    }
  }
  next();
}, handleChat);

module.exports = router;
