const registerUserHandler = async (app, db, encrypt, encode, decode) => {
  const SESSION_EXPIRES_IN = 1000 * 60 * 60 * 240; 
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
        const st = generateSessionToken(email, encrypt);
        const lo = await getCountry(location);
        await db.ref("users/" + userId).set({
          email: email,
          password: encrypt(password),
          username: username.trim(),
          dob: dob || null,
          location: lo || null,
          user_number: n,
          user_preference: null,
          resgisteredAt: new Date().getTime()
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
      const { email, password } = req.body;
      const st = generateSessionToken(email, encrypt);
      const r = (await db.ref("users/").once("value")).val();
      if(!r) res.status(404).json({ error: "User not found" });
      let usersObj = Object.values(r);
      console.log(email, password)
      usersObj = usersObj.find(t => t.email == email && t.password == encrypt(password));
      if(!usersObj) res.status(500).json({ error: "User not found" });
      const authToken = encode(usersObj.email, password);
      res.json({ message: "Login successfully", auth_token: authToken, sessionToken: st});
    } catch (err) {
      res.status(404).json({error: "Incorrect credentials"});
    }
  })
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
  app.post("/api/reg-privacy", requireAuth, async (req, res) => {
    try {
      const rt = req.body;
      const y = req.user;
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
  app.post("/api/reg-profile-picture", requireAuth, async (req, res) => {
    try {
      const rt = req.body;
      console.log(rt)
      const y = req.user;
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
          const pk = db.ref(`users/${k}/data/profile_pictures`).push().key;
          await db.ref(`users/${k}`).update({
            ["data"]: {
              profile_pictures: {
                [pk]: rt.profile_pictures
              },
              user_bio: rt.user_bio
            }
          })
          db.ref("users").once("value", (s) => {
            console.log(s.val())
          })
          res.json({ message: "Picture updated"});
        }
      }
    } catch(err) {
      console.log(err)
    }
  })
  app.get("/api/reg-follow-users", requireAuth, async (req, res) => {
    try {
      const y = req.user;
      console.log(y)
      if(!y?.code) {
        let u = await getUserByEmail(y.email);
        if(u) {
          let loc = u.location;
          const locData = await getCountry(loc);
          console.log(locData);
          res.json({ message: u});
        }
      }
    } catch(err) {
      console.log(err)
      res.status(500).json({error: "Error occurred, please try again"})
    }
  })
  async function requireAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader ||!authHeader.startsWith("Bearer ")) {
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
    console.log(token)
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
  async function getCountry(loc) {
    console.log(loc)
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${loc.latitude}&longitude=${loc.longitude}&localityLanguage=en`);
      if (!res.ok) {
        throw new Error("Failed to fetch location data");
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}


module.exports = { registerUserHandler };