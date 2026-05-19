// backend/controllers/contactController.js

const { sendEmail } = require('../utils/sendEmail');

exports.sendContact = async (req, res) => {

  try {

    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    // validation
    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {

      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });

    }

    // SEND EMAIL TO YOU
    await sendEmail({

      to: process.env.CONTACT_RECEIVER,

      subject: `New Contact Message: ${subject}`,

      text: `
Name: ${name}

Email: ${email}

Message:
${message}
      `,
    });

    // SUCCESS RESPONSE
    return res.status(200).json({

      success: true,

      message: 'Message sent successfully',

    });

  }

  catch (error) {

    console.error('CONTACT ERROR:', error);

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
