const registerUserHandler = async (app, db, encrypt, encode, decode) => {
  app.post("/api/register", async (req, res) => {
    const { password, email, username, location, dob, time } = req.body;
    try {
      if (!email || typeof email !== "string" || !email.split("@")[1] || !email.split("@")[1].split(".")[1]) {
        return res.status(400).json({ error: "Invalid email" });
      }
      if (!password || typeof password !== "string") {
        return res.status(400).json({ error: "Password is required" });
      }
      if (password.length < 5) {
        return res.status(400).json({ error: "Password is not secure" });
      }
      if (!username || typeof username !== "string" || !username.trim()) {
        return res.status(400).json({ error: "Username is required" });
      }
  
      const userId = db.ref("users/").push().key;
      let users = (await db.ref("users/").once("value")).val();
      if (users) users = Object.values(users);
  
      const vu = users ? users.find(function(r) { return r.email === email; }) : false;
  
      let r = true;
      let n;
      while (r) {
        const y = generateCellNumber();
        const cl = users ? users.find(function(u) { return u.user_number === y; }) : false;
        if (cl) {
          r = true;
        } else {
          r = false;
          n = y;
        }
      }
  
      if (!vu) {
        const st = generateSessionToken(email, time, encrypt);
        await db.ref("users/" + userId).set({
          email: email,
          password: encrypt(password),
          username: username.trim(),
          dob: dob || null,
          location: location || null,
          user_number: n,
          user_preference: null,
          resgisteredAt: time || new Date().getTime()
        });
        const authToken = encode(email, password);
        res.json({ message: "Registered successfully", auth_token: authToken, sessionToken: st });
      } else {
        res.status(400).json({ error: "User already exists" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
  app.post("/api/signin", async (req, res) => {
    try {
      const { email, password, time } = req.body;
      const st = generateSessionToken(email, time, encrypt);
      const r = (await db.ref("/users/").once("value")).val();
      if(!r) res.status(500).json({ error: "User not found" });
      let usersObj = Object.values(r);
      usersObj = usersObj.find(t => t.email == email && t.password == encrypt(password));
      if(!usersObj) res.status(500).json({ error: "User not found" });
      const authToken = encode(usersObj.email, password);
      res.json({ message: "Login successfully", auth_token: authToken, sessionToken: st});
    } catch (err) {
      console.log(err)
    }
  })
  app.post("/api/reg-privacy", requireAuth, async (req, res) => {
    try {
      const rt = req.body;
      const y = await verifySessionToken(req.user[0]);
      if(!y?.code) {
        let users = (await db.ref("users/").once("value")).val();
        if(!users) return;
        let usersKey = Object.keys(users);
        let usersObj = Object.values(users);
        let k;
        usersObj.forEach((d, i) => {
          if(d.email == y.email && d.password == y.password) {
            k = usersKey[i];
          }
        })
        if(k) {
          await db.ref(`users/${k}`).update({
            ["settings"]: {
              isDarkMode: false,
              ...rt
            }
          })
          db.ref("users").once("value", (s) => {
            console.log(s.val())
          })
          res.json({ message: "Settings updated"});
        }
      }
    } catch(err) {
      console.log(err)
    }
  })
  function requireAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader ||!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }
    const token = authHeader.split(" ")[1];
    try {
      req.user = decode(token);
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
      let rq = (await db.ref("users/").once("value")).val();
      if(!rq) return ({code: 401, message: "invalid session token"});
      rq = Object.values(rq);
      rq = rq.find(t => t.email == auth[0]);
      return rq;
    }
  }
  function generateSessionToken(email, currentTime, encrypt) {
    const epT = "1d";
    return encrypt(`${email}/${currentTime}/${epT}`);
  }
}


module.exports = { registerUserHandler };