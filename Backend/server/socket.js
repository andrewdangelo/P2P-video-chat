// roomCache stores media state per room per user
// Structure: Map<roomId, { [socketId]: { videoOn: boolean, audioOn: boolean } }>
const roomCache = new Map();

function registerSocketHandlers(io, socket) {
  console.log(`[+] New socket connected: ${socket.id}`);

  // JOIN ROOM
  socket.on('join-room', ({ roomId }, callback) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  const numClients = room ? room.size : 0;

  if (numClients >= 4) {
    console.log(`[ROOM] Room ${roomId} full, rejecting ${socket.id}`);
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

  console.log(`[ROOM] ${socket.id} joined room: ${roomId}`);

  const otherUsers = room ? Array.from(room) : [];
  socket.emit('all-users', otherUsers);
  socket.to(roomId).emit('user-joined', socket.id);

  // ✅ tell the client it's safe to emit media-toggle
  if (typeof callback === 'function') {
    callback({ success: true });
  }
});


  // MEDIA TOGGLE
  socket.on('media-toggle', ({ type, enabled }) => {
    const roomId = socket.roomId;

    if (!roomId) {
      console.warn(`[WARN] Media toggle failed: socket ${socket.id} has no roomId.`);
      return;
    }

    if (typeof type !== 'string' || typeof enabled !== 'boolean') {
      console.error(`[ERROR] Invalid media-toggle payload from ${socket.id}:`, { type, enabled });
      return;
    }

    const roomUsers = roomCache.get(roomId);
    if (!roomUsers || !roomUsers[socket.id]) {
      console.warn(`[WARN] Media state update failed: user ${socket.id} not found in cache for room ${roomId}`);
      return;
    }

    // Update media state in cache
    roomUsers[socket.id][`${type}On`] = enabled;

    console.log(`[MEDIA] Socket ${socket.id} in room ${roomId} toggled ${type} ${enabled ? 'ON' : 'OFF'}`);

    try {
      socket.to(roomId).emit('media-toggle', {
        from: socket.id,
        type,
        enabled,
      });
    } catch (err) {
      console.error(`[ERROR] Failed to broadcast media-toggle from ${socket.id} in room ${roomId}:`, err);
    }
  });

  // SIGNALING EVENTS
  socket.on('offer', ({ offer, to }) => {
    console.log(`[SIGNAL] ${socket.id} sending offer to ${to}`);
    socket.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, to }) => {
    console.log(`[SIGNAL] ${socket.id} sending answer to ${to}`);
    socket.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log(`[ICE] ${socket.id} sending ICE candidate to ${to}`);
    socket.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const roomId = socket.roomId;

    if (roomId) {
      const roomUsers = roomCache.get(roomId);
      if (roomUsers && roomUsers[socket.id]) {
        delete roomUsers[socket.id];
        console.log(`[ROOM] Removed ${socket.id} from roomCache for ${roomId}`);
      }

      // Clean up empty room
      if (roomUsers && Object.keys(roomUsers).length === 0) {
        roomCache.delete(roomId);
        console.log(`[ROOM] Deleted empty room ${roomId} from cache`);
      }

      socket.to(roomId).emit('user-left', socket.id);
    }

    console.log(`[-] Socket disconnected: ${socket.id}`);
  });
}

module.exports = registerSocketHandlers;
