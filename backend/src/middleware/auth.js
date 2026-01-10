const { auth } = require('../utils/firebase');

/**
 * Verify Firebase ID token and attach user info to request
 */
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    req.isAdmin = decodedToken.admin || false;

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Check if user is admin
 */
function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = verifyToken;
module.exports.requireAdmin = requireAdmin;
