/**
 * Validation Agent
 * Verifies required output fields and schema conformity of node execution results.
 */
class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  /**
   * Validate the output of a node execution step
   * @param {Object} node 
   * @param {Object} stepOutput 
   * @param {Object} context 
   * @returns {Object} { isValid: boolean, missingFields: Array<string>, score: number }
   */
  async validate(node, stepOutput, context = {}) {
    if (!stepOutput) {
      return {
        isValid: false,
        error: 'Step returned null or empty output payload',
        missingFields: ['payload'],
        confidence: 0.0,
      };
    }

    const nodeType = node.type || (node.data && node.data.type) || 'action';
    const missingFields = [];

    // Trigger validation
    if (nodeType === 'trigger') {
      if (stepOutput.triggered === false) {
        return { isValid: false, error: 'Trigger condition was not met' };
      }
    }

    // Action node validation
    if (nodeType === 'action') {
      const provider = node.data?.provider;
      if (provider === 'gmail') {
        if (!stepOutput.messageId && !stepOutput.messages) {
          missingFields.push('messageId');
        }
      } else if (provider === 'slack') {
        if (!stepOutput.ts && !stepOutput.status) {
          missingFields.push('delivery_timestamp');
        }
      } else if (provider === 'discord') {
        if (!stepOutput.messageId && !stepOutput.content) {
          missingFields.push('messageId');
        }
      } else if (provider === 'google-sheets') {
        if (!stepOutput.spreadsheetId && !stepOutput.updatedRows && !stepOutput.values) {
          missingFields.push('spreadsheetId');
        }
      }
    }

    // AI Transform validation
    if (nodeType === 'ai-transform' || nodeType === 'ai') {
      if (!stepOutput.result && !stepOutput.output && !stepOutput.extractedData) {
        missingFields.push('result');
      }
    }

    // Condition node validation
    if (nodeType === 'condition') {
      if (typeof stepOutput.conditionResult !== 'boolean') {
        missingFields.push('conditionResult');
      }
    }

    const isValid = missingFields.length === 0;

    return {
      isValid,
      missingFields,
      confidence: isValid ? 0.98 : 0.4,
      validationTimestamp: new Date().toISOString(),
    };
  }
}

module.exports = new ValidationAgent();
