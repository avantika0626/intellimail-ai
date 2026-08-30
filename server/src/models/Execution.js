const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const executionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    workflowSnapshot: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    currentNode: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // milliseconds
    },
    inputs: {
      type: Object,
      default: () => ({}),
    },
    outputs: {
      type: Object,
      default: () => ({}),
    },
    error: {
      type: Object,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    langGraphStatus: {
      type: String,
      enum: ['available', 'not-installed', 'emulated'],
      default: 'available',
    },
    owner: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseExecution = mongoose.models.Execution || mongoose.model('Execution', executionSchema);
const Execution = createHybridModel('Execution', 'executions', MongooseExecution);

module.exports = Execution;
