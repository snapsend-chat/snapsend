const SignIn = (app, db, encode, generateCellNumber, generateSessionToken, encrypt) => {
  app.post("/api/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      const st = generateSessionToken(email, encrypt);
      const r = (await db.ref("users/").once("value")).val();
      if(!r) res.status(404).json({ error: "User not found" });
      let usersObj = Object.values(r);
      usersObj = usersObj.find(t => t.email == email && t.auth.password == encrypt(password));
      if(!usersObj) res.status(500).json({ error: "User not found" });
      const { state } = usersObj.auth;
      const authToken = encode(usersObj.email, password);
      res.json({ message: "Login successfully", auth_token: authToken, sessionToken: st, state});
    } catch (err) {
      res.status(404).json({error: "Incorrect credentials"});
    }
  })
}

module.exports = { SignIn };