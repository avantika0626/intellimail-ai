const { validationResult } = require('express-validator');

/**
 * Middleware that checks express-validator results and formats 400 Bad Request
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatted,
    });
  }
  next();
}

module.exports = {
  validateRequest,
};
