/**
 * Recovery Agent
 * Classifies runtime failures and determines automated remediation strategy:
 * - retry_with_backoff
 * - escalate (to human operator / notification)
 */
class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
    this.maxRetries = 3;
  }

  /**
   * Classify failure reason and decide remediation action
   * @param {Error|Object} error 
   * @param {Object} node 
   * @param {number} currentRetryCount 
   * @returns {Object} { classification, strategy, delayMs, shouldRetry, escalationReason }
   */
  async classifyAndRecover(error, node, currentRetryCount = 0) {
    const message = (error.message || String(error)).toLowerCase();
    const code = error.code || '';

    let classification = 'API_FAILURE';
    let strategy = 'retry_with_backoff';
    let delayMs = Math.min(1000 * Math.pow(2, currentRetryCount), 10000);
    let shouldRetry = currentRetryCount < this.maxRetries;
    let escalationReason = null;

    if (code === 'AUTH_EXPIRED' || message.includes('auth_expired') || message.includes('token expired') || message.includes('unauthorized')) {
      classification = 'AUTH_EXPIRED';
      strategy = 'escalate';
      shouldRetry = false;
      escalationReason = `Authentication expired for ${node.data?.provider || 'service'}. Re-authentication required.`;
    } else if (code === 'INTEGRATION_NOT_CONNECTED' || message.includes('integration_not_connected') || message.includes('not connected')) {
      classification = 'AUTH_EXPIRED';
      strategy = 'escalate';
      shouldRetry = false;
      escalationReason = `Integration provider ${node.data?.provider || ''} is not connected.`;
    } else if (code === 'MISSING_FIELDS' || message.includes('missing_fields') || message.includes('required')) {
      classification = 'MISSING_FIELDS';
      strategy = 'escalate';
      shouldRetry = false;
      escalationReason = `Required input fields were missing during execution of node "${node.data?.label || node.id}".`;
    } else if (message.includes('rate limit') || message.includes('429') || message.includes('too many requests')) {
      classification = 'RATE_LIMIT';
      strategy = 'retry_with_backoff';
      delayMs = 5000 * (currentRetryCount + 1);
      shouldRetry = currentRetryCount < 4;
    } else if (message.includes('econnreset') || message.includes('etimedout') || message.includes('socket hang up') || message.includes('temporary')) {
      classification = 'TRANSIENT';
      strategy = 'retry_with_backoff';
      delayMs = 1500 * (currentRetryCount + 1);
      shouldRetry = currentRetryCount < this.maxRetries;
    } else {
      classification = 'API_FAILURE';
      if (!shouldRetry) {
        strategy = 'escalate';
        escalationReason = `Execution failed after ${currentRetryCount} retry attempts: ${error.message}`;
      }
    }

    return {
      classification,
      strategy,
      shouldRetry,
      delayMs,
      retryCount: currentRetryCount + (shouldRetry ? 1 : 0),
      escalationReason,
      recommendedAction: shouldRetry ? `Wait ${delayMs}ms and retry node` : 'Escalate to operator notification',
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new RecoveryAgent();
