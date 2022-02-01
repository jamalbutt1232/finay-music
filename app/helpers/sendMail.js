const nodemailer = require("nodemailer");

const sendMail = async (to, subject, message) => {
  return;
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: "foo@example.com",
    to: to,
    subject: subject,
    text: message,
  });
  console.log("message sent", info.messageId);
};

module.exports = sendMail;
