const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'active',
    },
    triggerConfig: {
      type: Object,
      default: () => ({
        type: 'manual',
        settings: {},
      }),
    },
    nodes: {
      type: Array,
      default: [],
    },
    edges: {
      type: Array,
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: ['automation', 'ai'],
    },
  },
  {
    timestamps: true,
  }
);

const MongooseWorkflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
const Workflow = createHybridModel('Workflow', 'workflows', MongooseWorkflow);

module.exports = Workflow;
