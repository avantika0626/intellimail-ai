const mongoose = require('mongoose');
const { createHybridModel } = require('./modelAdapter');

const emailTemplateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Template body is required'],
    },
    category: {
      type: String,
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseEmailTemplate =
  mongoose.models.EmailTemplate ||
  mongoose.model('EmailTemplate', emailTemplateSchema);
const EmailTemplate = createHybridModel(
  'EmailTemplate',
  'emailTemplates',
  MongooseEmailTemplate
);

module.exports = EmailTemplate;
