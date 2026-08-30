const Integration = require('../models/Integration');
const { encrypt, decrypt } = require('../utils/encryption');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const INTEGRATION_REGISTRY = {
  gmail: gmailIntegration,
  slack: slackIntegration,
  discord: discordIntegration,
  'google-sheets': googleSheetsIntegration,
};

class IntegrationService {
  /**
   * List all integrations for a user with sanitized connection states
   */
  async getUserIntegrations(userId) {
    const supportedProviders = ['gmail', 'slack', 'discord', 'google-sheets'];
    const dbIntegrations = await Integration.find({ owner: userId });
    const integrationMap = new Map(dbIntegrations.map(i => [i.provider, i]));

    return supportedProviders.map(provider => {
      const existing = integrationMap.get(provider);
      return {
        provider,
        isConnected: existing ? existing.isConnected : false,
        accountEmail: existing ? existing.accountEmail : null,
        scopes: existing ? existing.scopes : [],
        expiresAt: existing ? existing.expiresAt : null,
        lastChecked: existing ? existing.lastChecked : null,
      };
    });
  }

  /**
   * Get health status across all supported integrations
   */
  async getStatus(userId) {
    const integrations = await this.getUserIntegrations(userId);
    const summary = {
      total: integrations.length,
      connectedCount: integrations.filter(i => i.isConnected).length,
      providers: integrations,
    };
    return summary;
  }

  /**
   * Generate OAuth starting URL
   */
  getOAuthStartUrl(provider, userId) {
    const handler = INTEGRATION_REGISTRY[provider];
    if (!handler) {
      throw new Error(`Unsupported integration provider: ${provider}`);
    }
    const state = Buffer.from(JSON.stringify({ provider, userId, ts: Date.now() })).toString('base64');
    return handler.getOAuthUrl(state);
  }

  /**
   * Handle OAuth redirect callback and persist encrypted credentials
   */
  async handleOAuthCallback(provider, code, stateRaw) {
    const handler = INTEGRATION_REGISTRY[provider];
    if (!handler) {
      throw new Error(`Unsupported integration provider: ${provider}`);
    }

    let state = {};
    try {
      state = JSON.parse(Buffer.from(stateRaw, 'base64').toString('utf8'));
    } catch {
      // fallback
    }

    const userId = state.userId || 'system_default_user';
    const tokenData = await handler.handleCallback(code, stateRaw);

    // Encrypt sensitive tokens at rest
    const encryptedAccessToken = tokenData.accessToken ? encrypt(tokenData.accessToken) : null;
    const encryptedRefreshToken = tokenData.refreshToken ? encrypt(tokenData.refreshToken) : null;

    let integration = await Integration.findOne({ owner: userId, provider });
    if (integration) {
      integration.isConnected = true;
      integration.encryptedAccessToken = encryptedAccessToken;
      integration.encryptedRefreshToken = encryptedRefreshToken;
      integration.expiresAt = tokenData.expiresAt || null;
      integration.accountEmail = tokenData.accountEmail || null;
      integration.scopes = tokenData.scopes || [];
      integration.lastChecked = new Date();
      await integration.save();
    } else {
      integration = await Integration.create({
        owner: userId,
        provider,
        isConnected: true,
        encryptedAccessToken,
        encryptedRefreshToken,
        expiresAt: tokenData.expiresAt || null,
        accountEmail: tokenData.accountEmail || null,
        scopes: tokenData.scopes || [],
        lastChecked: new Date(),
      });
    }

    return {
      provider,
      isConnected: true,
      accountEmail: integration.accountEmail,
    };
  }

  /**
   * Connect or update integration manually (e.g. via direct API token or sandbox toggle)
   */
  async saveManualCredentials(userId, provider, { accessToken, refreshToken, accountEmail, isConnected = true }) {
    const handler = INTEGRATION_REGISTRY[provider];
    if (!handler) {
      throw new Error(`Unsupported integration provider: ${provider}`);
    }

    const encryptedAccessToken = accessToken ? encrypt(accessToken) : null;
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    let integration = await Integration.findOne({ owner: userId, provider });
    if (integration) {
      integration.isConnected = isConnected;
      if (encryptedAccessToken) integration.encryptedAccessToken = encryptedAccessToken;
      if (encryptedRefreshToken) integration.encryptedRefreshToken = encryptedRefreshToken;
      if (accountEmail) integration.accountEmail = accountEmail;
      integration.lastChecked = new Date();
      await integration.save();
    } else {
      integration = await Integration.create({
        owner: userId,
        provider,
        isConnected,
        encryptedAccessToken,
        encryptedRefreshToken,
        accountEmail: accountEmail || `${provider}-user@agentflow.io`,
        scopes: handler.getScopes(),
        lastChecked: new Date(),
      });
    }

    return {
      provider,
      isConnected: integration.isConnected,
      accountEmail: integration.accountEmail,
    };
  }

  /**
   * Get decrypted credentials for execution agent
   */
  async getDecryptedCredentials(userId, provider) {
    const record = await Integration.findOne({ owner: userId, provider });
    if (!record || !record.isConnected) {
      return null;
    }

    const accessToken = record.encryptedAccessToken ? decrypt(record.encryptedAccessToken) : null;
    const refreshToken = record.encryptedRefreshToken ? decrypt(record.encryptedRefreshToken) : null;

    return {
      accessToken,
      refreshToken,
      accountEmail: record.accountEmail,
      scopes: record.scopes,
      expiresAt: record.expiresAt,
    };
  }

  /**
   * Execute an action via the respective integration handler
   */
  async execute(userId, provider, actionType, params = {}) {
    const handler = INTEGRATION_REGISTRY[provider];
    if (!handler) {
      throw new Error(`Integration provider "${provider}" not found in registry`);
    }

    let credentials = await this.getDecryptedCredentials(userId, provider);

    // If sandbox mode is allowed or no strict creds in dev, allow fallback sandbox execution
    if (!credentials && params.allowSandbox !== false) {
      credentials = {
        accessToken: `sandbox_token_${provider}`,
        accountEmail: `sandbox-${provider}@agentflow.io`,
      };
    }

    if (!credentials) {
      const err = new Error(`INTEGRATION_NOT_CONNECTED: Provider '${provider}' is not connected. Connect it in Integrations.`);
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    return handler.executeAction(actionType, params, credentials);
  }
}

module.exports = new IntegrationService();
