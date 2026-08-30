const aiService = require('../services/aiService');
const gmailService = require('../services/gmailService');
const Activity = require('../models/Activity');

class AIController {
  async summarize(req, res, next) {
    try {
      const { content, subject, length, messageId } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, message: 'Email content is required' });
      }

      const result = await aiService.summarizeEmail(req.user.id, {
        content,
        subject,
        length: length || 'concise',
        messageId,
      });

      await Activity.create({
        userId: req.user.id,
        actionType: 'AI_SUMMARY',
        resourceId: messageId || subject || '',
        metadata: { subject, length },
        status: 'success',
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async generateReply(req, res, next) {
    try {
      const { content, subject, threadContext, tone, instructions, messageId } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, message: 'Email content is required' });
      }

      const result = await aiService.generateReply(req.user.id, {
        content,
        subject,
        threadContext,
        tone: tone || 'Professional',
        instructions,
        messageId,
      });

      await Activity.create({
        userId: req.user.id,
        actionType: 'AI_REPLY',
        resourceId: messageId || subject || '',
        metadata: { subject, tone, instructions },
        status: 'success',
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async explain(req, res, next) {
    try {
      const { content, subject, messageId } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, message: 'Email content is required' });
      }

      const result = await aiService.explainEmail(req.user.id, {
        content,
        subject,
        messageId,
      });

      await Activity.create({
        userId: req.user.id,
        actionType: 'EXPLAIN_EMAIL',
        resourceId: messageId || subject || '',
        metadata: { subject },
        status: 'success',
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async extractActions(req, res, next) {
    try {
      const { content, subject, messageId } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, message: 'Email content is required' });
      }

      const result = await aiService.extractActions(req.user.id, {
        content,
        subject,
        messageId,
      });

      await Activity.create({
        userId: req.user.id,
        actionType: 'ACTION_EXTRACTED',
        resourceId: messageId || subject || '',
        metadata: { actionCount: result.actions?.length || 0 },
        status: 'success',
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async extractDates(req, res, next) {
    try {
      const { content, subject, messageId } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, message: 'Email content is required' });
      }

      const result = await aiService.extractDates(req.user.id, {
        content,
        subject,
        messageId,
      });

      await Activity.create({
        userId: req.user.id,
        actionType: 'DATES_EXTRACTED',
        resourceId: messageId || subject || '',
        metadata: { dateCount: result.dates?.length || 0 },
        status: 'success',
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async classify(req, res, next) {
    try {
      const { content, subject } = req.body;
      const result = await aiService.classifyEmail(req.user.id, { content, subject });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async detectPriority(req, res, next) {
    try {
      const { content, subject } = req.body;
      const result = await aiService.detectPriority(req.user.id, { content, subject });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async rewrite(req, res, next) {
    try {
      const { text, tone, instruction } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, message: 'Text to rewrite is required' });
      }
      const result = await aiService.rewriteText(req.user.id, { text, tone, instruction });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async generateSubject(req, res, next) {
    try {
      const { body } = req.body;
      if (!body) {
        return res.status(400).json({ success: false, message: 'Email body is required' });
      }
      const result = await aiService.generateSubject(req.user.id, { body });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async smartSearch(req, res, next) {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      // Fetch user's emails
      const { messages } = await gmailService.getMessages(req.user.id, { limit: 50 });
      const result = await aiService.smartSearch(req.user.id, { query, emails: messages });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getDailySummary(req, res, next) {
    try {
      const { messages } = await gmailService.getMessages(req.user.id, { limit: 50 });
      const result = await aiService.dailySummary(req.user.id, { emails: messages });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
