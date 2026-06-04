const socketServer = require("socket.io");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
const http = require("http").createServer(app);
app.use(cors());

const io = socketServer(http, { cors: { origin: "*" } });
require('dotenv').config();
const { db } = require("./db.js");

async function init() {
  const communityRef = await db.ref(`communities/global_ping/`).once("value");
  if(!communityRef.exists()) {
    await db.ref(`communities/global_ping/`).set({
      name: "Global Ping",
      admins: ["9487832656"],
      description: "Global Ping 24/7 hangout. Zero borders, all timezones. Drop a ping, meet the world. Be kind, keep it fun."
    })
  }
}
init();

const { initializeEmail } = require("./utils/email-init.js");
const { registerUserHandler } = require("./authentication/auth.js");
const { encrypt, decrypt, encode, decode } = require("./utils/keycrypt.js");
const { socketInit } = require("./routes/socket-main.js");
const { InitializeAgent } = require("./utils/agent.js");

initializeEmail(app, process.env.RESEND_API_KEY);
registerUserHandler(app, db, encrypt, encode, decode);

//InitializeAgent(app);

socketInit(io, decode, db);

app.get("/", (req, res) => {
  res.send("<h1 style='color: red;'>Welcome to SnapSend! Database has been initialize!</h1>");
})
http.listen(5000, "0.0.0.0", () => {
  console.log("Server listening on port 5000");
});
