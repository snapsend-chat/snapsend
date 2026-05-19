const socketServer = require("socket.io");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
const http = require("http").createServer(app);
app.use(cors());

const io = socketServer(http, { cors: { origin: "*" } });
const admin = require("firebase-admin");
require('dotenv').config();
const serviceAccount = JSON.parse(process.env.FIREBASE_AUTH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://snapsend-97e65-default-rtdb.firebaseio.com"
});
const db = admin.database();

const { initializeEmail } = require("./utils/email-init.js");
const { registerUserHandler } = require("./authentication/auth.js");
const { encrypt, decrypt, encode, decode } = require("./utils/keycrypt.js");
const { socketInit } = require("./routes/socket-main.js");

const mailings = {
  key: process.env.GMAIL_KEY,
  user: process.env.GMAIL_ADDR
}

initializeEmail(app, mailings);
registerUserHandler(app, db, encrypt, encode, decode);

socketInit(io);

app.get("/", (req, res) => {
  res.send("<h1>Welcome to SnapSend!</h1>");
})
http.listen(5000, "0.0.0.0", () => {
  console.log("Server listening on port 5000");
});
