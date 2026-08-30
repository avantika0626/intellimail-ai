const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const orchestrator = require('../agents/orchestrator');
const { addExecutionJob } = require('../queues/executionQueue');

class ExecutionService {
  /**
   * List executions with pagination and filtering
   */
  async listExecutions(userId, query = {}) {
    const { status, workflowId, page = 1, limit = 20 } = query;
    const filter = { owner: userId };

    if (status) filter.status = status;
    if (workflowId) filter.workflowId = workflowId;

    const total = await Execution.countDocuments(filter);
    const executions = await Execution.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return {
      executions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        limit: Number(limit),
      },
    };
  }

  /**
   * Get single execution details
   */
  async getExecutionById(userId, executionId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId });
    if (!execution) {
      const err = new Error('Execution run not found');
      err.statusCode = 404;
      throw err;
    }
    return execution;
  }

  /**
   * Get granular timeline logs for execution
   */
  async getExecutionTimeline(userId, executionId) {
    // Verify ownership
    await this.getExecutionById(userId, executionId);

    const logs = await ExecutionLog.find({ executionId })
      .sort({ timestamp: 1 });

    return logs;
  }

  /**
   * Pause execution
   */
  async pauseExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (execution.status !== 'RUNNING' && execution.status !== 'PENDING') {
      const err = new Error(`Cannot pause execution with status ${execution.status}`);
      err.statusCode = 400;
      throw err;
    }

    orchestrator.setExecutionSignal(executionId, 'PAUSE');
    execution.status = 'PAUSED';
    await execution.save();

    return { success: true, message: 'Pause signal sent to orchestrator', status: 'PAUSED' };
  }

  /**
   * Resume execution
   */
  async resumeExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (execution.status !== 'PAUSED') {
      const err = new Error(`Cannot resume execution with status ${execution.status}`);
      err.statusCode = 400;
      throw err;
    }

    orchestrator.clearExecutionSignal(executionId);
    execution.status = 'RUNNING';
    await execution.save();

    // Re-queue in runner
    await addExecutionJob(executionId, userId);

    return { success: true, message: 'Execution resumed', status: 'RUNNING' };
  }

  /**
   * Cancel execution
   */
  async cancelExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) {
      const err = new Error(`Execution is already terminated (${execution.status})`);
      err.statusCode = 400;
      throw err;
    }

    orchestrator.setExecutionSignal(executionId, 'CANCEL');
    execution.status = 'CANCELLED';
    execution.endTime = new Date();
    await execution.save();

    return { success: true, message: 'Execution cancelled', status: 'CANCELLED' };
  }
}

module.exports = new ExecutionService();
