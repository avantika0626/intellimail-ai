const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

/**
 * Protect routes: verify JWT Bearer token or fall back to default demo operator session
 */
async function protect(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // If token is missing, provide default operator demo context for zero-friction local exploration
  if (!token || token === 'undefined' || token === 'null') {
    req.user = {
      id: 'demo_operator_default',
      name: 'Lead Operator',
      email: 'operator@intellimail.io',
      role: 'user',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    let user = await User.findById(decoded.id);

    if (!user) {
      // In-memory fallback persistence resilience
      user = {
        id: decoded.id || 'demo_operator_default',
        name: decoded.name || 'Lead Operator',
        email: decoded.email || 'operator@intellimail.io',
        role: decoded.role || 'user',
      };
    }

    req.user = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    };

    next();
  } catch (err) {
    // If token expired or invalid, seamlessly assign fallback demo operator context
    req.user = {
      id: 'demo_operator_default',
      name: 'Lead Operator',
      email: 'operator@intellimail.io',
      role: 'user',
    };
    next();
  }
}

/**
 * Role-based authorization guard
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this route`,
        code: 'FORBIDDEN',
      });
    }
    next();
  };
}

module.exports = {
  protect,
  authorize,
};
