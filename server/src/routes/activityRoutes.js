const express = require('express');
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', activityController.getActivity);
router.get('/analytics', activityController.getAnalytics);

module.exports = router;
