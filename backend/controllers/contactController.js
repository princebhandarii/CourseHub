const { sendEmail } = require('../utils/sendEmail');

exports.sendContact = async (req, res) => {

  try {

    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    // Validation
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

    // Send Email
    await sendEmail({

      to: process.env.CONTACT_RECEIVER,

      subject: `📩 New Contact Message: ${subject}`,

      text: `
New Query Received

Name: ${name}

Email: ${email}

Subject: ${subject}

Message:
${message}
      `,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">

          <h2>📩 New Contact Message</h2>

          <p>
            <strong>Name:</strong>
            ${name}
          </p>

          <p>
            <strong>Email:</strong>
            ${email}
          </p>

          <p>
            <strong>Subject:</strong>
            ${subject}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <div style="background:#f4f4f4;padding:15px;border-radius:8px;">
            ${message}
          </div>

        </div>
      `,
    });

    // Success Response
    return res.status(200).json({

      success: true,

      message: 'Message sent successfully',

    });

  }

  catch (error) {

    console.error('CONTACT ERROR:', error);

    return res.status(500).json({

      success: false,

      message: error.message || 'Failed to send message',

    });

  }

};
