const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Apply auth guard across all workflow routes
router.use(protect);

router.get('/dashboard', workflowController.getDashboard);

router.get('/', workflowController.list);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
  ],
  validateRequest,
  workflowController.create
);

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt is required for workflow generation'),
  ],
  validateRequest,
  workflowController.generate
);

router.get('/:id', workflowController.getById);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Workflow name cannot be empty'),
  ],
  validateRequest,
  workflowController.update
);

router.post('/:id/duplicate', workflowController.duplicate);

router.post('/:id/execute', workflowController.execute);

router.delete('/:id', workflowController.delete);

module.exports = router;
