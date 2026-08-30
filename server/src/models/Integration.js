const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    scopes: {
      type: [String],
      default: [],
    },
    encryptedAccessToken: {
      type: String,
      default: null,
    },
    encryptedRefreshToken: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    accountEmail: {
      type: String,
      default: null,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseIntegration = mongoose.models.Integration || mongoose.model('Integration', integrationSchema);
const Integration = createHybridModel('Integration', 'integrations', MongooseIntegration);

module.exports = Integration;
