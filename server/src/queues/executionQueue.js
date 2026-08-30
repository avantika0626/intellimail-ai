const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const config = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let queue = null;
let isUsingInMemoryQueue = false;

// Simple in-memory asynchronous queue fallback
const inMemoryJobs = [];

/**
 * Initialize Queue subsystem
 */
function initExecutionQueue() {
  try {
    const redisConnection = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2500,
      retryStrategy: () => null, // Don't loop endlessly if redis not running locally
      lazyConnect: true,
    });

    redisConnection.connect().then(() => {
      console.log('[Queue] Connected to Redis successfully');
      queue = new Queue('workflow-executions', { connection: redisConnection });

      new Worker('workflow-executions', async (job) => {
        const { executionId, userId } = job.data;
        console.log(`[Queue] Processing execution ${executionId} in BullMQ worker`);
        return orchestrator.runExecution(executionId, userId);
      }, { connection: redisConnection });

    }).catch((err) => {
      console.warn(`[Queue] Redis connection failed (${err.message}).`);
      console.log('[Queue] -> Activating IN-MEMORY Execution Queue fallback for background processing.');
      isUsingInMemoryQueue = true;
    });

  } catch (err) {
    console.log('[Queue] -> Activating IN-MEMORY Execution Queue fallback.');
    isUsingInMemoryQueue = true;
  }
}

/**
 * Add execution job to queue
 */
async function addExecutionJob(executionId, userId, options = {}) {
  if (queue && !isUsingInMemoryQueue) {
    try {
      return await queue.add('run-workflow', { executionId, userId }, {
        attempts: 1, // Orchestrator handles internal agentic retries
        removeOnComplete: true,
        ...options,
      });
    } catch (err) {
      console.warn('[Queue] Failed to add to BullMQ, executing via in-memory queue fallback');
    }
  }

  // In-memory queue async execution
  inMemoryJobs.push({ executionId, userId, status: 'queued', createdAt: new Date() });
  
  // Asynchronously dispatch execution without blocking HTTP request
  setImmediate(async () => {
    try {
      console.log(`[Queue:InMemory] Starting asynchronous execution ${executionId}`);
      await orchestrator.runExecution(executionId, userId);
    } catch (err) {
      console.error(`[Queue:InMemory] Error executing ${executionId}:`, err.message);
    }
  });

  return { id: `inmem_${executionId}`, data: { executionId, userId } };
}

module.exports = {
  initExecutionQueue,
  addExecutionJob,
  isInMemory: () => isUsingInMemoryQueue,
};
