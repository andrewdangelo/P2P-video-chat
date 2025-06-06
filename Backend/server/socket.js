function registerSocketHandlers(io, socket) {
  console.log(`[+] New socket connected: ${socket.id}`);

  // When a client joins a room
  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`[ROOM] ${socket.id} joined room: ${roomId}`);

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      const otherUserId = Array.from(room).find(id => id !== socket.id);
      if (otherUserId) {
        console.log(`[ROOM] Found other user (${otherUserId}) in room ${roomId}`);
        socket.emit('other-user', otherUserId);
        socket.to(otherUserId).emit('user-joined', socket.id);
      } else {
        console.log(`[ROOM] ${socket.id} is the first user in room ${roomId}`);
      }
    }
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
  socket.on('media-toggle', ({ type, enabled, to }) => {
    console.log(`[MEDIA] ${socket.id} toggled ${type}: ${enabled ? 'on' : 'off'}, forwarding to ${to}`);
    socket.to(to).emit('media-toggle', {
      from: socket.id,
      type,
      enabled
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[-] Socket disconnected: ${socket.id}`);
  });
}

module.exports = registerSocketHandlers;



