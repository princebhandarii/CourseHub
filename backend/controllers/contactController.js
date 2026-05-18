const { sendEmail } = require('../utils/sendEmail');

// @POST /api/contact
exports.sendContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // ── Send email TO you (admin receives the query) ──────────────────────
    await sendEmail({
      to:      process.env.CONTACT_RECEIVER,
      subject: `📩 New Contact Query: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="background:#111827; color:white; padding:20px; border-radius:8px 8px 0 0; margin:0;">
            New Contact Query — CourseHub
          </h2>
          <div style="border:1px solid #e5e7eb; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0; color:#6b7280; width:100px;"><strong>Name</strong></td>
                <td style="padding:8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280;"><strong>Email</strong></td>
                <td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280;"><strong>Subject</strong></td>
                <td style="padding:8px 0;">${subject}</td>
              </tr>
            </table>
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
            <p style="color:#6b7280; margin:0 0 8px;"><strong>Message:</strong></p>
            <p style="background:#f9fafb; padding:16px; border-radius:8px; margin:0; line-height:1.6;">
              ${message.replace(/\n/g, '<br/>')}
            </p>
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
            <p style="color:#9ca3af; font-size:12px; margin:0;">
              Reply directly to: <a href="mailto:${email}">${email}</a>
            </p>
          </div>
        </div>
      `,
    });

    // ── Send confirmation email TO the user ───────────────────────────────
    await sendEmail({
      to:      email,
      subject: `We received your message — CourseHub`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="background:#111827; color:white; padding:20px; border-radius:8px 8px 0 0; margin:0;">
            Thanks for reaching out, ${name}!
          </h2>
          <div style="border:1px solid #e5e7eb; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
            <p>We received your message and will get back to you within <strong>24 hours</strong>.</p>
            <p style="background:#f9fafb; padding:16px; border-radius:8px; color:#6b7280;">
              <strong>Your message:</strong><br/><br/>
              ${message.replace(/\n/g, '<br/>')}
            </p>
            <p style="color:#9ca3af; font-size:13px;">— The CourseHub Team</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact email error:', err.message);
    next(err);
  }
};