const FollowUsers = (app, db, requireAuth, getUserByEmail) => {
  app.get("/api/reg-follow-users", requireAuth, async (req, res) => {
    try {
      const y = req.user;
      if(!y?.code) {
        let u = await getUserByEmail(y.email);
        if(u) {
          let loc = u.location;
          let usersToFollow = await db.ref("users/").once("value");
          if(!usersToFollow.exists()) res.json({ users: []});
          usersToFollow = usersToFollow.val();
          const uk = Object.keys(usersToFollow);
          const v = uk.filter(t => t != y.id);
          let filteredUsers = [];
          if(v.length <= 0) res.json({ users: []});
          v.forEach((u, i) => {
            let { username, data, user_number, location } = usersToFollow[u];
            let pic = data.profile_pictures;
            pic = Object.values(pic);
            pic = pic.length > 0 ? pic[pic.length-1] : null;
            if(user_number == "9487832656") {
              filteredUsers.unshift({username, user_number, pic, id: u, location: "America"});
            } else {
              filteredUsers.push({username, user_number, pic, id: u, location: location?.countryName});
            }
          })
          res.json(filteredUsers);
        }
      }
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Error occurred, please try again"})
    }
  })
  //// Follow request - POST request ///
  app.post("/api/reg-follow-users", requireAuth, async (req, res) => {
    const data = req.body;
    console.log(data)
    try {
      const y = req.user;
      if(!y?.code) {
        let u = await getUserByEmail(y.email);
        if(u) {
          let validIds = [];
          if(data.length > 0) {
            for(let j = 0; j < data.length; j++) {
              let userSnapshot = await db.ref(`users/${data[j]}`).once("value");
              if(userSnapshot.exists()) {
                let followUserRef = await db.ref(`follow/${data[j]}`).once("value");
                validIds.push(data[j]);
              }
            }
            
          }
          res.json(data);
        }
      }
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Error occurred, please try again"})
    }
  })
}

module.exports = { FollowUsers };