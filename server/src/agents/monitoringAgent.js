const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');
const { emitExecutionEvent, emitUserNotification } = require('../config/socket');

/**
 * Monitoring Agent
 * Emits live Socket.IO events and persists ExecutionLog records for timeline auditing.
 */
class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  /**
   * Log an event from an agent, persist to DB, and emit to real-time room
   */
  async recordEvent({
    executionId,
    workflowId,
    nodeId = null,
    agent = 'monitoring',
    level = 'info',
    message,
    metadata = {},
    owner = null,
  }) {
    try {
      // 1. Persist granular log record
      const logEntry = await ExecutionLog.create({
        executionId: String(executionId),
        workflowId: String(workflowId),
        nodeId: nodeId ? String(nodeId) : null,
        agent,
        level,
        message,
        metadata,
        timestamp: new Date(),
      });

      // 2. Stream real-time event to connected Socket.IO room
      emitExecutionEvent(executionId, 'execution:log', {
        id: logEntry._id || logEntry.id,
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: logEntry.timestamp,
      });

      // 3. If log level is error or escalation, create a persistent notification for the user
      if ((level === 'error' || metadata.isEscalation || level === 'warning') && owner) {
        const notifType = metadata.isEscalation ? 'escalation' : (level === 'error' ? 'error' : 'warning');
        const notif = await Notification.create({
          owner,
          workflowId: String(workflowId),
          executionId: String(executionId),
          type: notifType,
          title: metadata.isEscalation ? 'Agent Escalation Required' : `Execution ${level.toUpperCase()}`,
          message,
        });

        emitUserNotification(owner, {
          id: notif._id || notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          executionId,
          workflowId,
          createdAt: notif.createdAt,
        });
      }

      return logEntry;
    } catch (err) {
      console.error('[MonitoringAgent] Failed to record event:', err.message);
      return null;
    }
  }

  /**
   * Emit execution status change (e.g. RUNNING, PAUSED, COMPLETED, FAILED)
   */
  emitStatusUpdate(executionId, status, extra = {}) {
    emitExecutionEvent(executionId, 'execution:status', {
      executionId,
      status,
      ...extra,
    });
  }
}

module.exports = new MonitoringAgent();
