const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO with Express HTTP Server
 */
function initSocket(httpServer, clientUrl) {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    // Join execution-specific live room
    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
        socket.emit('joined:execution', { executionId, timestamp: new Date() });
      }
    });

    // Leave execution room
    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    // Join user-specific notification room
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
}

/**
 * Get Socket.IO instance
 */
function getIO() {
  return io;
}

/**
 * Emit execution event to room
 */
function emitExecutionEvent(executionId, eventName, data) {
  if (io && executionId) {
    io.to(`execution:${executionId}`).emit(eventName, {
      executionId,
      ...data,
      timestamp: new Date(),
    });
  }
}

/**
 * Emit notification to user
 */
function emitUserNotification(userId, notification) {
  if (io && userId) {
    io.to(`user:${userId}`).emit('notification:new', notification);
    io.emit('notification:broadcast', notification); // Global fallback for single-user dev
  }
}

module.exports = {
  initSocket,
  getIO,
  emitExecutionEvent,
  emitUserNotification,
};
