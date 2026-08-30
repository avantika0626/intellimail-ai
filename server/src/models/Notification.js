const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const notificationSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      required: true,
      index: true,
    },
    workflowId: {
      type: String,
      default: null,
    },
    executionId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'escalation'],
      default: 'info',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const Notification = createHybridModel('Notification', 'notifications', MongooseNotification);

module.exports = Notification;
