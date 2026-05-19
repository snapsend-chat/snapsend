const UserPrivacy = (app, db, requireAuth) => {
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
          if(d.email == y.email && d.auth.password == y.auth.password) {
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
          await db.ref(`users/${k}/auth/`).update({
            ["state"]: 1,
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
}

module.exports = { UserPrivacy };