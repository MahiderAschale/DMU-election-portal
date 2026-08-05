// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true,
  logger: true
});

// verify connection
transporter.verify((error) => {
  if (error) {
    console.log(" SMTP NOT READY:", error);
  } else {
    console.log("SMTP READY TO SEND EMAILS");
  }
});

const sendEmail = async ({ to, subject, message }) => {
  try {
    console.log("Sending email to:", to);

    const info = await transporter.sendMail({
      from: `"Election System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message
    });

    console.log(" Email sent:", info.messageId);
    return true;

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return false;
  }
};

module.exports = sendEmail;