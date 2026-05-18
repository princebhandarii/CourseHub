const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"CourseHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,

      // Support both
      text,
      html,
    });

    console.log('✅ Email sent:', info.response);

  } catch (error) {

    console.log('❌ Email Error:', error);

    throw new Error('Email could not be sent');
  }
};

module.exports = { sendEmail };
