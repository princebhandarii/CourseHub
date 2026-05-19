// backend/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {

  const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {
      user: process.env.EMAIL_USER,

      pass: process.env.EMAIL_PASS,
    },
  });

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
