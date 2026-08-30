const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const connectedAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['google'],
      default: 'google',
      required: true,
    },
    providerAccountId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    accessTokenEncrypted: {
      type: String,
      required: true,
    },
    refreshTokenEncrypted: {
      type: String,
      default: '',
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },
    scopes: {
      type: [String],
      default: [],
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseConnectedAccount =
  mongoose.models.ConnectedAccount ||
  mongoose.model('ConnectedAccount', connectedAccountSchema);
const ConnectedAccount = createHybridModel(
  'ConnectedAccount',
  'connectedAccounts',
  MongooseConnectedAccount
);

module.exports = ConnectedAccount;
