const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

// ─── Helper: send token response ─────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// ─── REGISTER USER ───────────────────────────────────────────
exports.register = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      isVerified: true
    });

    sendTokenResponse(user, 201, res);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ─── LOGIN USER ──────────────────────────────────────────────
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────────
exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    console.log("EMAIL:", email);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save hashed token
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Expire in 10 min
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Frontend reset URL
    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    console.log("RESET URL:", resetUrl);

    const message = `
Password Reset Request

Click this link to reset your password:

${resetUrl}

If you did not request this email, ignore it.
`;

    // SEND EMAIL
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: message,
      html: `
        <h2>Password Reset</h2>
        <p>Click below button to reset password:</p>

        <a href="${resetUrl}" 
           style="
             display:inline-block;
             padding:12px 20px;
             background:#000;
             color:#fff;
             text-decoration:none;
             border-radius:8px;
           ">
           Reset Password
        </a>

        <p>If you did not request this, ignore this email.</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Reset email sent successfully'
    });

  } catch (err) {

    console.log("FORGOT PASSWORD ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────────
exports.resetPassword = async (req, res) => {

  try {

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// ─── ADMIN LOGIN ─────────────────────────────────────────────
exports.adminLogin = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      role: 'admin'
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    sendTokenResponse(user, 200, res);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ─── ADMIN REGISTER ──────────────────────────────────────────
exports.adminRegister = async (req, res) => {

  try {

    const { name, email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin secret'
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true
    });

    sendTokenResponse(user, 201, res);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ─── GET CURRENT USER ────────────────────────────────────────
exports.getMe = async (req, res) => {

  res.json({
    success: true,
    user: req.user
  });
};
