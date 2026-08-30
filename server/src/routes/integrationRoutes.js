const express = require('express');
const { body } = require('express-validator');
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// OAuth callback and error routes are called from provider redirects (no bearer auth header in browser redirect)
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);
router.get('/oauth/error', integrationController.handleOAuthError);

// Protected routes
router.get('/', protect, integrationController.list);
router.get('/status', protect, integrationController.getStatus);
router.get('/oauth/:provider/start', protect, integrationController.startOAuth);

router.post(
  '/',
  protect,
  [
    body('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets']).withMessage('Valid provider is required'),
  ],
  validateRequest,
  integrationController.saveManual
);

module.exports = router;
