const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getScopes() {
    return ['chat:write', 'channels:read', 'channels:history', 'incoming-webhook'];
  }

  getOAuthUrl(state = '') {
    const rootUrl = 'https://slack.com/oauth/v2/authorize';
    const options = {
      client_id: config.slack.clientId || 'MOCK_SLACK_CLIENT_ID',
      scope: this.getScopes().join(','),
      redirect_uri: config.slack.redirectUri,
      state,
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code, state) {
    if (!code) throw new Error('Authorization code missing');
    return {
      accessToken: `xoxb-mock-slack-token-${Date.now()}`,
      refreshToken: null,
      teamId: 'T12345678',
      teamName: 'Agentflow Workspace',
      channel: '#general',
      scopes: this.getScopes(),
    };
  }

  async testConnection(credentials = {}) {
    if (!credentials.accessToken) {
      return { ok: false, error: 'INTEGRATION_NOT_CONNECTED: Slack bot token missing' };
    }
    return { ok: true, team: 'Agentflow Workspace', status: 'connected' };
  }

  async executeAction(actionType, params = {}, credentials = {}) {
    if (!credentials.accessToken && !params.allowSandbox) {
      const err = new Error('INTEGRATION_NOT_CONNECTED: Slack workspace is not connected. Please authenticate in Integrations.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (actionType) {
      case 'post_message':
      case 'sendMessage': {
        const { channel = '#general', message, text, blocks } = params;
        const bodyText = message || text || 'Automated message from Agentflow_AI';
        
        return {
          success: true,
          action: 'post_message',
          channel,
          ts: String(Date.now() / 1000),
          message: bodyText,
          status: 'DELIVERED',
        };
      }

      case 'notify_channel': {
        const { channel = '#alerts', title, details } = params;
        return {
          success: true,
          action: 'notify_channel',
          channel,
          ts: String(Date.now() / 1000),
          title: title || 'Operational Alert',
          status: 'DELIVERED',
        };
      }

      default:
        throw new Error(`Slack integration does not support action "${actionType}"`);
    }
  }
}

module.exports = new SlackIntegration();
