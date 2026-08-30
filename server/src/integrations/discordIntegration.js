const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getScopes() {
    return ['bot', 'messages.read', 'webhook.incoming'];
  }

  getOAuthUrl(state = '') {
    const rootUrl = 'https://discord.com/api/oauth2/authorize';
    const options = {
      client_id: config.discord.clientId || 'MOCK_DISCORD_CLIENT_ID',
      permissions: '2048',
      scope: this.getScopes().join(' '),
      redirect_uri: config.discord.redirectUri,
      response_type: 'code',
      state,
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code, state) {
    if (!code) throw new Error('Authorization code missing');
    return {
      accessToken: `mock_discord_bot_token_${Date.now()}`,
      guildId: 'guild_9918273645',
      guildName: 'Agentflow Ops Guild',
      scopes: this.getScopes(),
    };
  }

  async testConnection(credentials = {}) {
    if (!credentials.accessToken) {
      return { ok: false, error: 'INTEGRATION_NOT_CONNECTED: Discord bot token missing' };
    }
    return { ok: true, guild: 'Agentflow Ops Guild', status: 'connected' };
  }

  async executeAction(actionType, params = {}, credentials = {}) {
    if (!credentials.accessToken && !params.allowSandbox) {
      const err = new Error('INTEGRATION_NOT_CONNECTED: Discord is not connected.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (actionType) {
      case 'post_message':
      case 'send_discord_message': {
        const { channelId = 'ops-alerts', message, content, embed } = params;
        const text = message || content || 'Agentflow execution notification';

        return {
          success: true,
          action: 'send_discord_message',
          channelId,
          messageId: `discord_${Math.random().toString(36).substring(2, 10)}`,
          content: text,
          timestamp: new Date().toISOString(),
        };
      }

      default:
        throw new Error(`Discord integration does not support action "${actionType}"`);
    }
  }
}

module.exports = new DiscordIntegration();
