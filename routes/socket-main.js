const { VideoStreamInit } = require("../utils/VideoStreamInit.js");
const { verifySessionToken } = require("../middleware/auth.middleware.js");

const socketInit = (io, decode, db) => {
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
    socket.on("fetch-chat-history", async (uid) => {
      let chatHistories = await db.ref(`users/${uid}/chatHistories`).once("value");
      let finalHistory = [];
      if(!chatHistories.exists()) {
        const ckey = db.ref(`users/${uid}/chatHistories/`).push().key;
        await db.ref(`users/${uid}/chatHistories/`).set({
          [ckey]: {
            type: "community",
            timestamp: new Date().getTime(),
            id: "global_ping"
          }
        });
        const response = await fetchCommunityDetails("global_ping");
        io.to(uid).emit("fetch-chat-history", [response]);
        return;
      }
      chatHistories = chatHistories.val();
      chatHistories = Object.values(chatHistories);
      for(let i = 0; i < chatHistories.length; i++) {
        const history = chatHistories[i];
        if(history.type == "community") {
          const response = await fetchCommunityDetails(history.id);
          finalHistory.push({...response, ...history});
        } else if(history.type == "friend") {
          const response = await fetchFriendDetails(history.id);
          finalHistory.push({...response, ...history});
        }
        if(chatHistories.length-1 == i) io.to(uid).emit("fetch-chat-history", finalHistory);
      }
    })
  })
  //// Helper functions ////
  //// Fetch community details ////
  async function fetchCommunityDetails(id) {
    const community = await db.ref(`communities/${id}`).once("value");
    if(community.exists()) {
      return community.val();
    }
  }
  
  //// Fetch friend details ////
  async function fetchFriendDetails(id) {
    
  }
}

module.exports = { socketInit };
