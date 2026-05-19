// backend/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {

  // ✅ Create transporter
  const transporter = nodemailer.createTransport({

    host: process.env.EMAIL_HOST || 'smtp.gmail.com',

    port: Number(process.env.EMAIL_PORT) || 587,

    secure: false,

    auth: {
      user: process.env.EMAIL_USER,

      pass: process.env.EMAIL_PASS,
    },
  });

  // ✅ Verify transporter connection
  await transporter.verify();

  // ✅ Send email
  const info = await transporter.sendMail({

    from: `"CourseHub" <${process.env.EMAIL_USER}>`,

    to,

    subject,

    text,

    html,
  });

  console.log('✅ Email sent:', info.messageId);

  return info;
};

module.exports = { sendEmail };
