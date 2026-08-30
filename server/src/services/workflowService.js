const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const aiService = require('./aiService');
const { addExecutionJob } = require('../queues/executionQueue');

class WorkflowService {
  /**
   * Get aggregated dashboard statistics
   */
  async getDashboardStats(userId) {
    const totalWorkflows = await Workflow.countDocuments({ owner: userId });
    const activeWorkflows = await Workflow.countDocuments({ owner: userId, status: 'active' });
    
    const recentExecutions = await Execution.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalRuns = await Execution.countDocuments({ owner: userId });
    const completedRuns = await Execution.countDocuments({ owner: userId, status: 'COMPLETED' });
    const failedRuns = await Execution.countDocuments({ owner: userId, status: 'FAILED' });
    
    const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 100;

    // Calculate average duration
    const allCompleted = await Execution.find({ owner: userId, status: 'COMPLETED' }).limit(50);
    const avgDurationMs = allCompleted.length > 0
      ? Math.round(allCompleted.reduce((acc, curr) => acc + (curr.duration || 0), 0) / allCompleted.length)
      : 850;

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        totalRuns,
        completedRuns,
        failedRuns,
        successRate,
        avgDurationMs,
      },
      recentExecutions,
    };
  }

  /**
   * List workflows with search, filter, and pagination
   */
  async listWorkflows(userId, query = {}) {
    const { search, status, tag, page = 1, limit = 20 } = query;
    const filter = { owner: userId };

    if (status) filter.status = status;
    if (tag) filter.tags = { $in: [tag] };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Workflow.countDocuments(filter);
    const workflows = await Workflow.find(filter)
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return {
      workflows,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        limit: Number(limit),
      },
    };
  }

  /**
   * Create workflow
   */
  async createWorkflow(userId, data) {
    const workflow = await Workflow.create({
      ...data,
      owner: userId,
      version: 1,
      status: data.status || 'active',
      tags: data.tags || ['automation'],
      nodes: data.nodes || [],
      edges: data.edges || [],
    });
    return workflow;
  }

  /**
   * Generate workflow via AI and return graph
   */
  async generateWorkflow(prompt, options = {}) {
    return aiService.generateWorkflow(prompt, options);
  }

  /**
   * Get single workflow by ID
   */
  async getWorkflowById(userId, workflowId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }
    return workflow;
  }

  /**
   * Update workflow structure, bump version
   */
  async updateWorkflow(userId, workflowId, updateData) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }

    const newVersion = (workflow.version || 1) + 1;

    const updated = await Workflow.findByIdAndUpdate(
      workflowId,
      {
        ...updateData,
        version: newVersion,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return updated;
  }

  /**
   * Duplicate workflow
   */
  async duplicateWorkflow(userId, workflowId) {
    const original = await this.getWorkflowById(userId, workflowId);
    
    const clone = await Workflow.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      owner: userId,
      status: 'draft',
      triggerConfig: original.triggerConfig,
      nodes: original.nodes,
      edges: original.edges,
      tags: original.tags,
      version: 1,
    });

    return clone;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(userId, workflowId) {
    const deleted = await Workflow.findByIdAndDelete(workflowId);
    if (!deleted) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, message: 'Workflow deleted successfully' };
  }

  /**
   * Trigger workflow execution run
   */
  async executeWorkflow(userId, workflowId, inputs = {}) {
    const workflow = await this.getWorkflowById(userId, workflowId);

    // Create execution snapshot
    const execution = await Execution.create({
      workflowId: String(workflow._id || workflow.id),
      workflowSnapshot: {
        id: String(workflow._id || workflow.id),
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        triggerConfig: workflow.triggerConfig,
        version: workflow.version,
      },
      status: 'PENDING',
      inputs,
      owner: userId,
      startTime: new Date(),
      langGraphStatus: 'available',
    });

    // Dispatch to background execution queue
    await addExecutionJob(String(execution._id || execution.id), userId);

    return execution;
  }
}

module.exports = new WorkflowService();
