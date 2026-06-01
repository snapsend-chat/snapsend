const { Resend } = require('resend');
const { OneTimeStore } = require("./redis.js");

const initializeEmail = (app, key) => {
  const resend = new Resend(key);
  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, html } = req.body;
      const data = await resend.emails.send({
        from: "SnapSend <snapsend.core@gmail.com>",
        to: to,
        subject: subject,
        html: html
      });
      res.json({ success: true, id: data.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { initializeEmail };