const { db } = require("../db.js");
async function verifySessionToken(token) {
  if(token) {
    let auth = token.split("/");
    let rq = await getUserByEmail(auth[0]);
    if(!rq) return null;
    if(new Date().getTime() > parseInt(auth[1])) {
      return null;
    }
    return rq;
  }
}
async function getUserByEmail(email) {
  const snapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value");
  if(!snapshot.exists()) return null;
  const data = snapshot.val();
  const key = Object.keys(data)[0];
  return {
    id: key,
    ...data[key]
  }
}

module.exports = { verifySessionToken, getUserByEmail };