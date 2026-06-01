const admin = require("firebase-admin");
require('dotenv').config();
const serviceAccount = JSON.parse(process.env.FIREBASE_AUTH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://snapsend-97e65-default-rtdb.firebaseio.com"
});
const db = admin.database();
module.exports = { db };