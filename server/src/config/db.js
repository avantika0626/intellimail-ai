const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;
let isInMemoryFallback = false;

// Global In-Memory Document Store when MongoDB is offline
const memoryStore = new Proxy({}, {
  get: (target, prop) => {
    if (!target[prop]) {
      target[prop] = new Map();
    }
    return target[prop];
  }
});

/**
 * Connect to MongoDB with timeout, fallback to in-memory store if unavailable
 */
async function connectDB() {
  if (isConnected) return;

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${config.mongoUri}`);
    
    // Set a 2.5-second timeout for local dev resilience
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });

    isConnected = true;
    isInMemoryFallback = false;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Falling back to in-memory store mode.');
      isInMemoryFallback = true;
    });

  } catch (error) {
    console.warn(`[Database] Unable to connect to MongoDB (${error.message}).`);
    console.log('[Database] -> Activating high-performance IN-MEMORY Document Database fallback.');
    console.log('[Database] -> All email operations, AI history, and auth will persist in memory for this session.');
    isConnected = true;
    isInMemoryFallback = true;
  }
}

function getDatabaseStatus() {
  return {
    connected: isConnected,
    mode: isInMemoryFallback ? 'in-memory-fallback' : 'mongodb',
    uri: isInMemoryFallback ? 'memory://local' : config.mongoUri,
  };
}

module.exports = {
  connectDB,
  getDatabaseStatus,
  memoryStore,
  isUsingFallback: () => isInMemoryFallback,
};
