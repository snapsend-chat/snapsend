const { VideoStreamInit } = require("../utils/VideoStreamInit.js");

const { verifySessionToken } = require("../middleware/auth.middleware.js");

const socketInit = (io, decode) => {
  const authenticateSocket = async (socket, next) => {
    const token = socket.handshake.auth.token;
    const decoded = await verifySessionToken(decode(token)[0]);
    if (!decoded) {
        socket.disconnect();
        return next(new Error("Unauthorized"));
    }
    socket.user = decoded;
    next();
  };
  io.use(authenticateSocket);
  
  io.on("connection", (socket) => {
    VideoStreamInit(socket);
    const { username, data, id, user_number, settings, email, location } = socket.user;
    socket.join(id);
    socket.emit("connected", {
      username,
      data,
      id,
      user_number,
      settings,
      email,
      location
    });
  })
}

module.exports = { socketInit };
