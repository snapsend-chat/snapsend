const socketInit = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", (id) => {
      socket.join(id);
      io.to(id).emit("join-room", "hello world")
    })
  })
}

module.exports = { socketInit };