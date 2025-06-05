function registerSocketHandlers(io, socket) {
  socket.on('join', () => {
    const clients = Array.from(io.sockets.sockets.keys()).filter(id => id !== socket.id);
    socket.emit('users', clients); // send list of other users
  });

  socket.on('offer', ({ offer, to }) => {
    socket.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, to }) => {
    socket.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
  });
}

module.exports = registerSocketHandlers;
