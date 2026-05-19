const ProfilePicture = (app, db, requireAuth) => {
  app.post("/api/reg-profile-picture", requireAuth, async (req, res) => {
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
          const pk = db.ref(`users/${k}/data/profile_pictures`).push().key;
          await db.ref(`users/${k}`).update({
            ["data"]: {
              profile_pictures: {
                [pk]: rt.profile_pictures
              },
              user_bio: rt.user_bio
            }
          })
          await db.ref(`users/${k}/auth/`).update({
            ["state"]: 2
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
}

module.exports = { ProfilePicture };