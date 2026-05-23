const { VideoStreamInit } = require("../utils/VideoStreamInit.js");
const socketInit = (io) => {
  io.on("connection", (socket) => {
    VideoStreamInit(socket);
  })
}

module.exports = { socketInit };
