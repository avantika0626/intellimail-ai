const express = require('express');
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// User preferences
router.get('/preferences', settingsController.getPreferences);
router.put('/preferences', settingsController.updatePreferences);

// Email templates CRUD
router.get('/templates', settingsController.getTemplates);
router.post('/templates', settingsController.createTemplate);
router.put('/templates/:id', settingsController.updateTemplate);
router.delete('/templates/:id', settingsController.deleteTemplate);

module.exports = router;
