const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth protection to all AI intelligence routes
router.use(protect);

router.post('/summarize', aiController.summarize);
router.post('/generate-reply', aiController.generateReply);
router.post('/explain', aiController.explain);
router.post('/extract-actions', aiController.extractActions);
router.post('/extract-dates', aiController.extractDates);
router.post('/classify', aiController.classify);
router.post('/priority', aiController.detectPriority);
router.post('/rewrite', aiController.rewrite);
router.post('/generate-subject', aiController.generateSubject);
router.post('/smart-search', aiController.smartSearch);
router.get('/daily-summary', aiController.getDailySummary);

module.exports = router;
