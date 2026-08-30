/**
 * Abstract Base Class for Third-Party Integrations
 */
class BaseIntegration {
  constructor(providerName) {
    if (this.constructor === BaseIntegration) {
      throw new Error('BaseIntegration is abstract and cannot be instantiated directly.');
    }
    this.providerName = providerName;
  }

  /**
   * Get provider unique identifier
   */
  getProviderName() {
    return this.providerName;
  }

  /**
   * Return required OAuth scopes
   */
  getScopes() {
    return [];
  }

  /**
   * Generate OAuth authorization URL
   */
  getOAuthUrl(state = '') {
    throw new Error('getOAuthUrl() must be implemented by subclass');
  }

  /**
   * Exchange code for access & refresh tokens
   */
  async handleCallback(code, state) {
    throw new Error('handleCallback() must be implemented by subclass');
  }

  /**
   * Verify whether the credentials are valid and live
   */
  async testConnection(credentials = {}) {
    throw new Error('testConnection() must be implemented by subclass');
  }

  /**
   * Execute an integration action (e.g. sendEmail, postMessage, appendRow)
   */
  async executeAction(actionType, params = {}, credentials = {}) {
    throw new Error(`executeAction(${actionType}) must be implemented by subclass`);
  }
}

module.exports = BaseIntegration;
