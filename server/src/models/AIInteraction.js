const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const aiInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'summarize',
        'generate-reply',
        'explain',
        'extract-actions',
        'extract-dates',
        'classify',
        'priority',
        'rewrite',
        'generate-subject',
        'smart-search',
        'daily-summary',
      ],
    },
    resourceId: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: 'deterministic-nlp',
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAIInteraction =
  mongoose.models.AIInteraction ||
  mongoose.model('AIInteraction', aiInteractionSchema);
const AIInteraction = createHybridModel(
  'AIInteraction',
  'aiInteractions',
  MongooseAIInteraction
);

module.exports = AIInteraction;
