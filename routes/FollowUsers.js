const FollowUsers = (app, db, requireAuth, getUserByEmail) => {
  app.get("/api/reg-follow-users", requireAuth, async (req, res) => {
    try {
      const y = req.user;
      if (y?.code) {
        return res.json({ users: [] });
      }
      const u = await getUserByEmail(y.email);
      if (!u) {
        return res.json({ users: [] });
      }
      const usersSnapshot = await db.ref("users/").once("value");
      if (!usersSnapshot.exists()) {
        return res.json({ users: [] });
      }
      const usersToFollow = usersSnapshot.val();
      const otherUserIds = Object.keys(usersToFollow).filter(id => id !== y.id);
      if (otherUserIds.length === 0) {
        return res.json({ users: [] });
      }
      // Resolve all async work in parallel using Promise.all
      const userResults = await Promise.all(
        otherUserIds.map(async (p) => {
          const [followRefO, followRefM] = await Promise.all([
            db.ref(`follow/${p}/${u.id}`).once("value"),
            db.ref(`following/${u.id}/${p}`).once("value")
          ]);
          // Skip already-followed users
          if (followRefO.exists() || followRefM.exists()) return null;
          const { username, data, user_number, location } = usersToFollow[p];
          const pics = data?.profile_pictures ? Object.values(data.profile_pictures) : [];
          const pic = pics.length > 0 ? pics[pics.length - 1] : null;
          const resolvedLocation = user_number === "9487832656" ? "America" : location?.countryName;
          return { username, user_number, pic, id: p, location: resolvedLocation };
        })
      );
      const filteredUsers = userResults.filter(u => u !== null).sort((a, b) => (a.user_number === "9487832656" ? -1 : 0));
      return res.json(filteredUsers);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error occurred, please try again" });
    }
  });
  
  // Follow request - POST request //
  app.post("/api/reg-follow-users", requireAuth, async (req, res) => {
    const data = req.body;
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
                let followUserRefO = await db.ref(`follow/${data[j]}/${y.id}`).once("value");
                let followUserRefM = await db.ref(`following/${y.id}/${data[j]}`).once("value");
                if(!followUserRefO.exists() && !followUserRefM.exists()) {
                  await db.ref(`follow/${data[j]}/`).update({[y.id]: {date: new Date().getTime(), uid: y.id}});
                  await db.ref(`following/${y.id}/`).update({[data[j]]: {date: new Date().getTime(), uid: data[j]}});
                  validIds.push(data[j]);
                }
              }
            }
          }
          res.status(200).json({message: "done"});
        }
      }
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Error occurred, please try again"})
    }
  })
}

module.exports = { FollowUsers };