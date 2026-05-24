const FollowUsers = (app, db, requireAuth, getUserByEmail) => {
  app.get("/api/reg-follow-users", requireAuth, async (req, res) => {
    try {
      const y = req.user;
      console.log(y)
      if(!y?.code) {
        let u = await getUserByEmail(y.email);
        let usersToFollow = await db.ref("users/").once("value");
        if(!usersToFollow.exists()) res.json({ users: []});
        usersToFollow = usersToFollow.val();
        const uk = Object.keys(usersToFollow);
        const v = uk.filter(t => t != y.id);
        let filteredUsers = [];
        if(v.length <= 0) res.json({ users: []});
        v.forEach((u, i) => {
          let { username, data, user_number } = usersToFollow[u];
          let pic = data.profile_pictures;
          pic = Object.values(pic);
          pic = pic.length > 0 ? pic[pic.length-1] : null;
          filteredUsers.push({username, user_number, pic, id: u})
        })
        console.log(filteredUsers)
        //console.log(usersToFollow[v])
        if(u) {
          let loc = u.location;
          res.json(filteredUsers);
        }
      }
    } catch(err) {
      console.log(err)
      res.status(500).json({error: "Error occurred, please try again"})
    }
  })
}

module.exports = { FollowUsers };