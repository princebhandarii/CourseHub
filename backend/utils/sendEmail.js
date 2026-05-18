const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {

  try {

    console.log("EMAIL FUNCTION STARTED");

    const transporter = nodemailer.createTransport({

      service: 'gmail',

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

    });

    console.log("TRANSPORT CREATED");

    const info = await transporter.sendMail({

      from: `"CourseHub" <${process.env.EMAIL_USER}>`,

      to,

      subject,

      text,

      html,

    });

    console.log("EMAIL SENT");
    console.log(info);

    return info;

  } catch (error) {

    console.log("SEND EMAIL ERROR:");
    console.log(error);

    throw error;
  }
};

module.exports = { sendEmail };
