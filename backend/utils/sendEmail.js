const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {

  try {

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    console.log('EMAIL SENT:', response);

    return response;

  } catch (error) {

    console.log('EMAIL ERROR:', error);

    throw new Error('Email sending failed');
  }
};

module.exports = { sendEmail };
