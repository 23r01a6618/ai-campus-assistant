const rateLimit = require('express-rate-limit');

// Per-user rate limiting (20 queries per hour)
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => {
    // Use user ID from Firebase token or IP address
    return req.userId || req.ip;
  },
  message: 'You have reached the maximum number of queries. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { chatLimiter };
