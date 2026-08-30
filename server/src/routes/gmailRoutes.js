const express = require('express');
const gmailController = require('../controllers/gmailController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// OAuth Handlers
router.get('/oauth/url', protect, gmailController.getOAuthUrl);
router.get('/oauth/callback', gmailController.handleOAuthCallback);

// Account status
router.get('/account/status', protect, gmailController.getAccountStatus);
router.post('/account/disconnect', protect, gmailController.disconnectAccount);

// Messages & Mailbox
router.get('/messages', protect, gmailController.getMessages);
router.get('/messages/:id', protect, gmailController.getMessage);
router.get('/threads/:id', protect, gmailController.getThread);
router.post('/send', protect, gmailController.sendEmail);
router.post('/drafts', protect, gmailController.saveDraft);

// Action endpoints
router.post('/messages/:id/star', protect, gmailController.setStar);
router.post('/messages/:id/read', protect, gmailController.setRead);
router.post('/messages/:id/archive', protect, gmailController.archiveMessage);
router.post('/messages/:id/delete', protect, gmailController.deleteMessage);

module.exports = router;
