const integrationService = require('../services/integrationService');

class IntegrationController {
  async list(req, res, next) {
    try {
      const list = await integrationService.getUserIntegrations(req.user.id);
      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const status = await integrationService.getStatus(req.user.id);
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const url = integrationService.getOAuthStartUrl(provider, req.user.id);
      res.status(200).json({
        success: true,
        authUrl: url,
      });
    } catch (err) {
      next(err);
    }
  }

  async handleOAuthCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;
      const result = await integrationService.handleOAuthCallback(provider, code, state);
      
      // Redirect back to frontend integrations page with success query param
      res.redirect(`/integrations?connected=${provider}`);
    } catch (err) {
      next(err);
    }
  }

  async handleOAuthError(req, res, next) {
    res.status(400).json({
      success: false,
      error: req.query.error_description || req.query.error || 'OAuth authorization was cancelled or failed',
      code: 'OAUTH_ERROR',
    });
  }

  async saveManual(req, res, next) {
    try {
      const { provider, accessToken, refreshToken, accountEmail, isConnected } = req.body;
      const result = await integrationService.saveManualCredentials(req.user.id, provider, {
        accessToken,
        refreshToken,
        accountEmail,
        isConnected,
      });
      res.status(200).json({
        success: true,
        message: `Credentials updated for ${provider}`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationController();
