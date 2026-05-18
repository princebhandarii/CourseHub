const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials (EMAIL_USER / EMAIL_PASS) are not set in environment variables.');
  }

  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true only for port 465

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,  // Gmail: use an App Password, not your account password
    },
  });

  // Verify connection config before sending
  await transporter.verify();

  const info = await transporter.sendMail({
    from:    `"CourseHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log('✅ Email sent:', info.messageId);
  return info;
};

module.exports = { sendEmail };
