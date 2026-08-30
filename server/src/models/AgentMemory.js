const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const agentMemorySchema = new mongoose.Schema(
  {
    workflowId: {
      type: String,
      required: true,
      index: true,
    },
    executionId: {
      type: String,
      required: true,
      index: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAgentMemory = mongoose.models.AgentMemory || mongoose.model('AgentMemory', agentMemorySchema);
const AgentMemory = createHybridModel('AgentMemory', 'agentMemories', MongooseAgentMemory);

module.exports = AgentMemory;
