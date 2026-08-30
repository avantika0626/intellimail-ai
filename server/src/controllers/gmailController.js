const gmailService = require('../services/gmailService');

class GmailController {
  async getOAuthUrl(req, res, next) {
    try {
      const state = req.user?.id ? String(req.user.id) : '';
      const url = gmailService.getOAuthUrl(state);
      res.json({
        success: true,
        url,
        configured: Boolean(url),
      });
    } catch (err) {
      next(err);
    }
  }

  async handleOAuthCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      const userId = req.user?.id || state;

      if (!code) {
        return res.status(400).json({ success: false, message: 'Missing authorization code' });
      }

      const result = await gmailService.handleOAuthCallback(code, userId);
      // Redirect back to frontend
      res.redirect('http://localhost:3000/dashboard?connected=true');
    } catch (err) {
      next(err);
    }
  }

  async getAccountStatus(req, res, next) {
    try {
      const status = await gmailService.getAccountStatus(req.user.id);
      res.json({ success: true, data: status });
    } catch (err) {
      next(err);
    }
  }

  async disconnectAccount(req, res, next) {
    try {
      const result = await gmailService.disconnectAccount(req.user.id);
      res.json({ success: true, message: 'Gmail disconnected' });
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { folder, q, page, limit } = req.query;
      const result = await gmailService.getMessages(req.user.id, {
        folder: folder || 'INBOX',
        q: q || '',
        limit: parseInt(limit || '50', 10),
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getMessage(req, res, next) {
    try {
      const message = await gmailService.getMessage(req.user.id, req.params.id);
      res.json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  }

  async getThread(req, res, next) {
    try {
      const thread = await gmailService.getThread(req.user.id, req.params.id);
      res.json({ success: true, data: thread });
    } catch (err) {
      next(err);
    }
  }

  async saveDraft(req, res, next) {
    try {
      const { id, to, cc, bcc, subject, body, threadId } = req.body;
      const result = await gmailService.saveDraft(req.user.id, {
        id,
        to,
        cc,
        bcc,
        subject,
        body,
        threadId,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async sendEmail(req, res, next) {
    try {
      const { id, draftId, to, cc, bcc, subject, body, threadId, inReplyTo } = req.body;
      if (!to || !body) {
        return res.status(400).json({ success: false, message: 'Recipient and body are required' });
      }

      const result = await gmailService.sendEmail(req.user.id, {
        id: id || draftId,
        draftId: draftId || id,
        to,
        cc,
        bcc,
        subject: subject || '(No Subject)',
        body,
        threadId,
        inReplyTo,
      });

      res.json({ success: true, data: result, message: 'Email sent successfully' });
    } catch (err) {
      next(err);
    }
  }

  async setStar(req, res, next) {
    try {
      const { starred } = req.body;
      const result = await gmailService.setStar(req.user.id, req.params.id, starred !== false);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async setRead(req, res, next) {
    try {
      const { read } = req.body;
      const result = await gmailService.setRead(req.user.id, req.params.id, read !== false);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async archiveMessage(req, res, next) {
    try {
      const result = await gmailService.archiveMessage(req.user.id, req.params.id);
      res.json({ success: true, data: result, message: 'Email archived' });
    } catch (err) {
      next(err);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const result = await gmailService.deleteMessage(req.user.id, req.params.id);
      res.json({ success: true, data: result, message: 'Email moved to Trash' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GmailController();
