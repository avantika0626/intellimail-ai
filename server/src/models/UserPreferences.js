const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    defaultTone: {
      type: String,
      enum: ['Professional', 'Friendly', 'Formal', 'Concise', 'Apologetic', 'Confident'],
      default: 'Professional',
    },
    summaryLength: {
      type: String,
      enum: ['concise', 'detailed'],
      default: 'concise',
    },
    priorityEnabled: {
      type: Boolean,
      default: true,
    },
    classificationEnabled: {
      type: Boolean,
      default: true,
    },
    smartSearchEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseUserPreferences =
  mongoose.models.UserPreferences ||
  mongoose.model('UserPreferences', userPreferencesSchema);
const UserPreferences = createHybridModel(
  'UserPreferences',
  'userPreferences',
  MongooseUserPreferences
);

module.exports = UserPreferences;
