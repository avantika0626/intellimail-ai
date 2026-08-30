const UserPreferences = require('../models/UserPreferences');
const EmailTemplate = require('../models/EmailTemplate');

class SettingsController {
  async getPreferences(req, res, next) {
    try {
      let prefs = await UserPreferences.findOne({ userId: req.user.id });
      if (!prefs) {
        prefs = await UserPreferences.create({
          userId: req.user.id,
          defaultTone: 'Professional',
          summaryLength: 'concise',
          priorityEnabled: true,
          classificationEnabled: true,
          smartSearchEnabled: true,
        });
      }
      res.json({ success: true, data: prefs });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const { defaultTone, summaryLength, priorityEnabled, classificationEnabled, smartSearchEnabled } = req.body;
      let prefs = await UserPreferences.findOne({ userId: req.user.id });
      if (!prefs) {
        prefs = new UserPreferences({ userId: req.user.id });
      }

      if (defaultTone) prefs.defaultTone = defaultTone;
      if (summaryLength) prefs.summaryLength = summaryLength;
      if (priorityEnabled !== undefined) prefs.priorityEnabled = Boolean(priorityEnabled);
      if (classificationEnabled !== undefined) prefs.classificationEnabled = Boolean(classificationEnabled);
      if (smartSearchEnabled !== undefined) prefs.smartSearchEnabled = Boolean(smartSearchEnabled);

      await prefs.save();
      res.json({ success: true, data: prefs, message: 'Preferences updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getTemplates(req, res, next) {
    try {
      let templates = await EmailTemplate.find({ userId: req.user.id }).lean();
      if (templates.length === 0) {
        // Seed helpful standard default templates
        const seed1 = await EmailTemplate.create({
          userId: req.user.id,
          name: 'Meeting Follow-Up',
          category: 'Meetings',
          subject: 'Follow-up: Architecture & Project Review',
          body: '<p>Hi,</p><p>Thank you for taking the time to meet today. As discussed, here are the agreed action items and next steps...</p><p>Best regards,<br/>Operator</p>',
        });
        const seed2 = await EmailTemplate.create({
          userId: req.user.id,
          name: 'Acknowledgment & Receipt',
          category: 'General',
          subject: 'Received & Reviewing',
          body: '<p>Hi,</p><p>Thank you for sending this over. I am currently reviewing the details and will get back to you with comments shortly.</p><p>Best regards,<br/>Operator</p>',
        });
        templates = [seed1, seed2];
      }

      res.json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  }

  async createTemplate(req, res, next) {
    try {
      const { name, subject, body, category } = req.body;
      if (!name || !body) {
        return res.status(400).json({ success: false, message: 'Template name and body are required' });
      }

      const template = await EmailTemplate.create({
        userId: req.user.id,
        name: name.trim(),
        subject: subject || '',
        body,
        category: category || 'General',
      });

      res.json({ success: true, data: template, message: 'Template created' });
    } catch (err) {
      next(err);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { name, subject, body, category } = req.body;

      const template = await EmailTemplate.findOne({ _id: id, userId: req.user.id });
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }

      if (name) template.name = name.trim();
      if (subject !== undefined) template.subject = subject;
      if (body) template.body = body;
      if (category) template.category = category;

      await template.save();
      res.json({ success: true, data: template, message: 'Template updated' });
    } catch (err) {
      next(err);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params;
      await EmailTemplate.findOneAndDelete({ _id: id, userId: req.user.id });
      res.json({ success: true, message: 'Template deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SettingsController();
