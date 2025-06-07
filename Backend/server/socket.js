function registerSocketHandlers(io, socket) {
  console.log(`[+] New socket connected: ${socket.id}`);

  // When a client joins a room
  socket.on('join-room', ({ roomId }) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;

    if (numClients >= 4) {
      console.log(`[ROOM] Room ${roomId} full, rejecting ${socket.id}`);
      socket.emit('room-full');
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;
    console.log(`[ROOM] ${socket.id} joined room: ${roomId}`);

    const otherUsers = room ? Array.from(room) : [];
    socket.emit('all-users', otherUsers);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // WebRTC signaling
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

  // Media toggle: notify peers of cam/mic state
  socket.on('media-toggle', ({ type, enabled }) => {
    const roomId = socket.roomId;
    if (!roomId) return;
    console.log(`[MEDIA] ${socket.id} toggled ${type}: ${enabled ? 'on' : 'off'}`);
    socket.to(roomId).emit('media-toggle', {
      from: socket.id,
      type,
      enabled
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (roomId) {
      socket.to(roomId).emit('user-left', socket.id);
    }
    console.log(`[-] Socket disconnected: ${socket.id}`);
  });
}

module.exports = registerSocketHandlers;



