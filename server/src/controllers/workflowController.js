const workflowService = require('../services/workflowService');

class WorkflowController {
  async getDashboard(req, res, next) {
    try {
      const stats = await workflowService.getDashboardStats(req.user.id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const result = await workflowService.listWorkflows(req.user.id, req.query);
      res.status(200).json({
        success: true,
        data: result.workflows,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Workflow created successfully',
        data: workflow,
      });
    } catch (err) {
      next(err);
    }
  }

  async generate(req, res, next) {
    try {
      const { prompt, options } = req.body;
      const generated = await workflowService.generateWorkflow(prompt, options);
      res.status(200).json({
        success: true,
        message: 'Workflow generated from prompt',
        data: generated,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: workflow,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await workflowService.updateWorkflow(req.user.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Workflow updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async duplicate(req, res, next) {
    try {
      const clone = await workflowService.duplicateWorkflow(req.user.id, req.params.id);
      res.status(201).json({
        success: true,
        message: 'Workflow cloned successfully',
        data: clone,
      });
    } catch (err) {
      next(err);
    }
  }

  async execute(req, res, next) {
    try {
      const execution = await workflowService.executeWorkflow(req.user.id, req.params.id, req.body.inputs);
      res.status(202).json({
        success: true,
        message: 'Workflow execution triggered',
        data: execution,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await workflowService.deleteWorkflow(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkflowController();
