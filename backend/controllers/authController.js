const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');


// ─────────────────────────────────────────────────────────────
// Helper: Send JWT Token Response
// ─────────────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {

  const token = generateToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};


// ─────────────────────────────────────────────────────────────
// Register User
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      isVerified: true,
    });

    sendTokenResponse(user, 201, res);

  } catch (err) {

    console.log('REGISTER ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────
// Login User
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    sendTokenResponse(user, 200, res);

  } catch (err) {

    console.log('LOGIN ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    // Check email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save token in DB
    user.resetPasswordToken = hashedToken;

    // Expire in 10 minutes
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email message
    const message = `
Password Reset Request

Click the link below to reset your password:

${resetUrl}

This link will expire in 10 minutes.

If you did not request this, please ignore this email.
`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'CourseHub Password Reset',
      text: message,
    });

    return res.status(200).json({
      success: true,
      message: 'Reset email sent successfully',
    });

  } catch (err) {

    console.log('FORGOT PASSWORD ERROR:', err);

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to send reset email',
    });
  }
};


// ─────────────────────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {

  try {

    // Hash token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Update password
    user.password = req.body.password;

    // Remove reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);

  } catch (err) {

    console.log('RESET PASSWORD ERROR:', err);

    return res.status(500).json({
      success: false,
      message: 'Password reset failed',
    });
  }
};


// ─────────────────────────────────────────────────────────────
// Admin Login
// ─────────────────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      role: 'admin',
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    sendTokenResponse(user, 200, res);

  } catch (err) {

    console.log('ADMIN LOGIN ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────
// Admin Register
// ─────────────────────────────────────────────────────────────
exports.adminRegister = async (req, res) => {

  try {

    const { name, email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin secret',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true,
    });

    sendTokenResponse(user, 201, res);

  } catch (err) {

    console.log('ADMIN REGISTER ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────
// Get Current User
// ─────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {

  res.status(200).json({
    success: true,
    user: req.user,
  });
};
