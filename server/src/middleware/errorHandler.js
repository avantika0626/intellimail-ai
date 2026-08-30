const config = require('../config/env');

/**
 * Centralized Express Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'INTERNAL_ERROR';

  // Handle specific known error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    errorCode = 'VALIDATION_ERROR';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}`;
    errorCode = 'DUPLICATE_KEY';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errorCode = 'AUTH_INVALID';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    errorCode = 'AUTH_EXPIRED';
  } else if (err.message && err.message.includes('INTEGRATION_NOT_CONNECTED')) {
    statusCode = 400;
    errorCode = 'INTEGRATION_NOT_CONNECTED';
  } else if (err.message && err.message.includes('AUTH_EXPIRED')) {
    statusCode = 401;
    errorCode = 'AUTH_EXPIRED';
  }

  // Safe logging without leaking sensitive payload
  if (config.nodeEnv !== 'test') {
    console.error(`[ErrorHandler] [${req.method} ${req.originalUrl}] ${statusCode} - ${message}`);
    if (statusCode === 500 && config.nodeEnv === 'development') {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code: errorCode,
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
