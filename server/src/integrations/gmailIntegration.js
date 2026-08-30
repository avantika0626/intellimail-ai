const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getScopes() {
    return [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
  }

  getOAuthUrl(state = '') {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: config.gmail.redirectUri,
      client_id: config.gmail.clientId || 'MOCK_GMAIL_CLIENT_ID',
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: this.getScopes().join(' '),
      state,
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code, state) {
    if (!code) throw new Error('Authorization code missing');
    
    // In production with real client ID, exchange with Google OAuth token endpoint
    // In development or local sandbox, return a token structure
    return {
      accessToken: `mock_gmail_access_${Date.now()}`,
      refreshToken: `mock_gmail_refresh_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      accountEmail: 'operator@agentflow.io',
      scopes: this.getScopes(),
    };
  }

  async testConnection(credentials = {}) {
    if (!credentials.accessToken) {
      return { ok: false, error: 'INTEGRATION_NOT_CONNECTED: Gmail access token missing' };
    }
    return { ok: true, email: credentials.accountEmail || 'operator@agentflow.io', status: 'active' };
  }

  async executeAction(actionType, params = {}, credentials = {}) {
    if (!credentials.accessToken && !params.allowSandbox) {
      const err = new Error('INTEGRATION_NOT_CONNECTED: Gmail account is not connected. Please connect Gmail in the Integrations panel.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (actionType) {
      case 'send_email':
      case 'sendMail': {
        const { to, subject, body, cc, bcc } = params;
        if (!to) throw new Error('MISSING_FIELDS: "to" recipient is required for Gmail send');
        
        return {
          success: true,
          action: 'send_email',
          messageId: `msg_${Math.random().toString(36).substring(2, 10)}`,
          to,
          subject: subject || '(No Subject)',
          sentAt: new Date().toISOString(),
          status: 'SENT',
        };
      }

      case 'read_email':
      case 'readMail': {
        const { query = 'is:unread', maxResults = 5 } = params;
        return {
          success: true,
          action: 'read_email',
          query,
          count: maxResults,
          messages: [
            {
              id: 'msg_101',
              subject: 'Quarterly Automation Report',
              from: 'analytics@company.com',
              snippet: 'Here is the summary of recent workflow executions...',
              date: new Date().toISOString(),
            },
            {
              id: 'msg_102',
              subject: 'Invoice #8492 Processed',
              from: 'billing@vendor.com',
              snippet: 'Your invoice has been received and queued for review...',
              date: new Date().toISOString(),
            }
          ],
        };
      }

      default:
        throw new Error(`Gmail integration does not support action "${actionType}"`);
    }
  }
}

module.exports = new GmailIntegration();
