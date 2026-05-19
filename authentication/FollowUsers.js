const FollowUsers = (app, db, requireAuth) => {
  app.get("/api/reg-follow-users", requireAuth, async (req, res) => {
    try {
      const y = req.user;
      console.log(y)
      if(!y?.code) {
        let u = await getUserByEmail(y.email);
        if(u) {
          let loc = u.location;
          res.json({ message: loc});
        }
      }
    } catch(err) {
      console.log(err)
      res.status(500).json({error: "Error occurred, please try again"})
    }
  })
}

module.exports = { FollowUsers };