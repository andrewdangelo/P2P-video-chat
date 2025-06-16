const log = require('../utils/logger');

// roomCache stores media state per room per user
// Structure: Map<roomId, { [socketId]: { videoOn: boolean, audioOn: boolean } }>
const roomCache = new Map();

// Helper for timestamp
function timestamp() {
  const date = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
  });

  // Converts "6/15/2025, 21:05:33" => "2025-06-15 21:05:33"
  const [mdy, time] = date.split(', ');
  const [month, day, year] = mdy.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${time}`;
}

function logRoomCache() {
  log.room(`[${timestamp()}] === [ROOM CACHE STATE] ===`);
  for (const [roomId, users] of roomCache.entries()) {
    log.room(`[${timestamp()}] Room ${roomId}:`);
    for (const [socketId, media] of Object.entries(users)) {
      log.room(
        `[${timestamp()}]   ${socketId} → video: ${media.videoOn ? '🟢 ON' : '🔴 OFF'}, audio: ${media.audioOn ? '🟢 ON' : '🔴 OFF'}`
      );
    }
  }
  log.room(`[${timestamp()}] ===========================`);
}

function registerSocketHandlers(io, socket) {
  log.info(`[${timestamp()}] New socket connected: ${socket.id}`);

  // JOIN ROOM
  socket.on('join-room', ({ roomId }, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;

    if (numClients >= 4) {
      log.room(`[${timestamp()}] Room ${roomId} full, rejecting ${socket.id}`);
      socket.emit('room-full');
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;

    if (!roomCache.has(roomId)) {
      roomCache.set(roomId, {});
    }

    roomCache.get(roomId)[socket.id] = {
      videoOn: true,
      audioOn: true,
    };

    log.room(`[${timestamp()}] ${socket.id} joined room: ${roomId}`);
    logRoomCache();

    const otherUsers = room ? Array.from(room) : [];
    socket.emit('all-users', otherUsers);
    socket.to(roomId).emit('user-joined', socket.id);

    if (typeof callback === 'function') {
      callback({ success: true });
    }
  });

  // MEDIA TOGGLE
  socket.on('media-toggle', ({ type, enabled }) => {
    const roomId = socket.roomId;

    if (!roomId) {
      log.warn(`[${timestamp()}] Media toggle failed: socket ${socket.id} has no roomId.`);
      return;
    }

    if (typeof type !== 'string' || typeof enabled !== 'boolean') {
      log.error(`[${timestamp()}] Invalid media-toggle payload from ${socket.id}:`, { type, enabled });
      return;
    }

    const roomUsers = roomCache.get(roomId);
    if (!roomUsers || !roomUsers[socket.id]) {
      log.warn(`[${timestamp()}] Media state update failed: user ${socket.id} not found in cache for room ${roomId}`);
      return;
    }

    roomUsers[socket.id][`${type}On`] = enabled;

    log.media(`[${timestamp()}] ${socket.id} in room ${roomId} toggled ${type} ${enabled ? 'ON' : 'OFF'}`);
    logRoomCache();

    try {
      socket.to(roomId).emit('media-toggle', {
        from: socket.id,
        type,
        enabled,
      });
    } catch (err) {
      log.error(`[${timestamp()}] Failed to broadcast media-toggle from ${socket.id} in room ${roomId}:`, err);
    }
  });

  // SIGNALING EVENTS
  socket.on('offer', ({ offer, to }) => {
    log.signal(`[${timestamp()}] ${socket.id} sending offer to ${to}`);
    socket.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, to }) => {
    log.signal(`[${timestamp()}] ${socket.id} sending answer to ${to}`);
    socket.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    log.ice(`[${timestamp()}] ${socket.id} sending ICE candidate to ${to}`);
    socket.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const roomId = socket.roomId;

    if (roomId) {
      const roomUsers = roomCache.get(roomId);
      if (roomUsers && roomUsers[socket.id]) {
        delete roomUsers[socket.id];
        log.room(`[${timestamp()}] Removed ${socket.id} from roomCache for ${roomId}`);
        logRoomCache();
      }

      if (roomUsers && Object.keys(roomUsers).length === 0) {
        roomCache.delete(roomId);
        log.room(`[${timestamp()}] Deleted empty room ${roomId} from cache`);
        logRoomCache();
      }

      socket.to(roomId).emit('user-left', socket.id);
    }

    log.info(`[${timestamp()}] Socket disconnected: ${socket.id}`);
  });
}

module.exports = registerSocketHandlers;
