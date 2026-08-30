const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getScopes() {
    return [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly',
    ];
  }

  getOAuthUrl(state = '') {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: config.googleSheets.redirectUri,
      client_id: config.googleSheets.clientId || 'MOCK_GOOGLE_SHEETS_CLIENT_ID',
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
    return {
      accessToken: `mock_sheets_access_${Date.now()}`,
      refreshToken: `mock_sheets_refresh_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      accountEmail: 'operator@agentflow.io',
      scopes: this.getScopes(),
    };
  }

  async testConnection(credentials = {}) {
    if (!credentials.accessToken) {
      return { ok: false, error: 'INTEGRATION_NOT_CONNECTED: Google Sheets credentials missing' };
    }
    return { ok: true, email: credentials.accountEmail || 'operator@agentflow.io', status: 'connected' };
  }

  async executeAction(actionType, params = {}, credentials = {}) {
    if (!credentials.accessToken && !params.allowSandbox) {
      const err = new Error('INTEGRATION_NOT_CONNECTED: Google Sheets is not connected.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (actionType) {
      case 'append_row':
      case 'appendRow': {
        const { spreadsheetId = 'sheet_automation_log', range = 'Sheet1!A:Z', values = [] } = params;
        
        return {
          success: true,
          action: 'append_row',
          spreadsheetId,
          tableRange: range,
          updatedRows: 1,
          updatedColumns: Array.isArray(values) ? values.length : 1,
          updatedRange: `${range.split('!')[0] || 'Sheet1'}!A12:E12`,
          appendedAt: new Date().toISOString(),
        };
      }

      case 'read_range':
      case 'readRange': {
        const { spreadsheetId = 'sheet_automation_log', range = 'Sheet1!A1:D10' } = params;
        return {
          success: true,
          action: 'read_range',
          spreadsheetId,
          range,
          values: [
            ['Timestamp', 'User', 'Status', 'Cost'],
            ['2026-08-30T10:00:00Z', 'alice@company.com', 'Approved', '$450.00'],
            ['2026-08-30T10:15:00Z', 'bob@company.com', 'Pending', '$1,200.00'],
          ],
        };
      }

      default:
        throw new Error(`Google Sheets integration does not support action "${actionType}"`);
    }
  }
}

module.exports = new GoogleSheetsIntegration();
