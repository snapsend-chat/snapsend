const { Register } = require("./Register.js");
const { SignIn } = require("./SignIn.js");
const { UserPrivacy } = require("./UserPrivacy.js");
const { ProfilePicture } = require("./ProfilePicture.js");
const { FollowUsers } = require("./FollowUsers.js");

const registerUserHandler = async (app, db, encrypt, encode, decode) => {
  const SESSION_EXPIRES_IN = 1000 * 60 * 60 * 240; 
  Register(app, db, SESSION_EXPIRES_IN, encode, generateCellNumber, generateSessionToken, encrypt);
  SignIn(app, db, encode, generateSessionToken, encrypt);
  UserPrivacy(app, db, requireAuth);
  ProfilePicture(app, db, requireAuth);
  FollowUsers(app, db, requireAuth);
  
  const getUserByEmail = async (email) => {
    const snapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value");
    if(!snapshot.exists()) return null;
    const data = snapshot.val();
    const key = Object.keys(data)[0];
    return {
      id: key,
      ...data[key]
    }
  }
  
  async function requireAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }
    const token = authHeader.split(" ")[1];
    const t = await verifySessionToken(decode(token)[0]);
    try {
      req.user = t;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }
  function generateCellNumber() {
    let r = Math.random();
    r = r.toString();
    r = r.split(".")[1];
    r = r.slice(0, 10);
    return r;
  }
  async function verifySessionToken(token) {
    if(token) {
      let auth = token.split("/");
      let rq = await getUserByEmail(auth[0]);
      if(!rq) return ({code: 401, message: "Invalid session token"});
      if(new Date().getTime() > parseInt(auth[1])) {
        throw new Error("Session expired");
      }
      return rq;
    }
  }
  function generateSessionToken(email, encrypt) {
    let currentTime = Date.now()+SESSION_EXPIRES_IN;
    return encrypt(`${email}/${currentTime}`);
  }
}


module.exports = { registerUserHandler };