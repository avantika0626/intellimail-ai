const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        'AI_SUMMARY',
        'AI_REPLY',
        'EMAIL_SENT',
        'EMAIL_ARCHIVED',
        'EMAIL_STARRED',
        'EMAIL_UNSTARRED',
        'EMAIL_READ',
        'EMAIL_UNREAD',
        'EMAIL_DELETED',
        'ACTION_EXTRACTED',
        'DATES_EXTRACTED',
        'EXPLAIN_EMAIL',
        'REWRITE_EMAIL',
        'OAUTH_CONNECTED',
      ],
    },
    resourceId: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseActivity =
  mongoose.models.Activity || mongoose.model('Activity', activitySchema);
const Activity = createHybridModel('Activity', 'activities', MongooseActivity);

module.exports = Activity;
