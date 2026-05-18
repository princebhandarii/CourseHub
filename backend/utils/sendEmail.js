const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {

    const transporter = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      tls: {
        rejectUnauthorized: false,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"CourseHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email Sent:', info.response);

    return info;

  } catch (error) {

    console.log('❌ Email Error:', error);

    throw error;
  }
};

module.exports = { sendEmail };
