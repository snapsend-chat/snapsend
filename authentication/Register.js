const Register = (app, db, SESSION_EXPIRES_IN, encode, generateCellNumber, generateSessionToken, encrypt) => {
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
        await db.ref("users/" + userId).set({
          auth: {
            password: encrypt(password),
            state: 0,
          },
          email: email,
          username: username.trim(),
          dob: dob || null,
          location: location || null,
          user_number: n,
          user_preference: null,
          resgisteredAt: new Date().getTime(),
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
}

module.exports = { Register };