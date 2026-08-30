const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const executionLogSchema = new mongoose.Schema(
  {
    executionId: {
      type: String,
      required: true,
      index: true,
    },
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      default: null,
    },
    agent: {
      type: String,
      enum: ['planner', 'execution', 'validation', 'recovery', 'monitoring', 'orchestrator'],
      required: true,
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      default: () => ({}),
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseExecutionLog = mongoose.models.ExecutionLog || mongoose.model('ExecutionLog', executionLogSchema);
const ExecutionLog = createHybridModel('ExecutionLog', 'executionLogs', MongooseExecutionLog);

module.exports = ExecutionLog;
