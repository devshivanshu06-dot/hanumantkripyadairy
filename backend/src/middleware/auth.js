const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next, requiredRole = null) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-otp -otp_expires_at');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({ error: `Access denied. ${requiredRole} privileges required.` });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const auth = (req, res, next) => verifyToken(req, res, next);
const adminAuth = (req, res, next) => verifyToken(req, res, next, 'admin');

module.exports = { auth, adminAuth };