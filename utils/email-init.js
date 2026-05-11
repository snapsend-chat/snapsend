const nodemailer = require("nodemailer");

const initializeEmail = (app, mailings) => {
  app.post("/api/request-code", async (req, res) => {
    const { email, code } = req.body;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: mailings.user,
        pass: mailings.key
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    const mailOptions = {
      from: "joshuadivine985@gmail.com",
      to: email,
      subject: "SnapSend - Code",
      text: "",
      html: `
        <html>
        <body>
          <h2>Hello there,</h2>
          <p>You recently signed up for our application. To complete your registration, please use the verification code below:</p>
          <h1>Verification Code: ${code}</h1>
          <p>Enter this code on the verification page to activate your account.</p>
          <p>If you didn't sign up for our application, please disregard this email.</p>
          <p>Best regards,</p>
          <p>SnapSend Team.</p>
        </body>
        </html>
      `
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).send({
          code: 500,
          message: "Invalid email address"
        });
      } else {
        res.json({ code: 200, message: "Code was sent" });
      }
    });
  });
}

module.exports = { initializeEmail };