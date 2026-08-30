import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize or get singleton Socket.IO connection
 */
export function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time agent gateway:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected from server');
    });
  }

  return socket;
}

/**
 * Join execution room to receive agent events
 */
export function joinExecutionRoom(executionId) {
  const s = getSocket();
  if (s && executionId) {
    s.emit('join:execution', executionId);
  }
}

/**
 * Leave execution room
 */
export function leaveExecutionRoom(executionId) {
  const s = getSocket();
  if (s && executionId) {
    s.emit('leave:execution', executionId);
  }
}

/**
 * Join user notification room
 */
export function joinUserRoom(userId) {
  const s = getSocket();
  if (s && userId) {
    s.emit('join:user', userId);
  }
}

export default getSocket;
