const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

// ─── Helper: send token response ──────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// ─── @POST /api/auth/register  (public user signup) ──────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({ name, email, password, otp, otpExpire, role: 'user' });

    // Send OTP email (non-blocking)
    sendEmail({
      to: email,
      subject: 'Verify your account - CourseHub',
      html: `<h2>Hi ${name},</h2><p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`,
    }).catch(console.error);

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/login  (any user) ────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/admin/login  (admin only) ────────────────────────────────
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password.' });

    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/admin/register  (first admin setup ONLY - disable in prod) 
exports.adminRegister = async (req, res, next) => {
  try {
    const { name, email, password, adminSecret } = req.body;
    // Require a secret key in env to create admin accounts
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: 'Invalid admin secret.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role: 'admin', isVerified: true });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/verify-otp ───────────────────────────────────────────────
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpire: { $gt: new Date() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Account verified successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/auth/forgot-password ─────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email.' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset - CourseHub',
      html: `<p>Click to reset your password: <a href="${resetURL}">${resetURL}</a></p><p>Valid 30 minutes.</p>`,
    });

    res.json({ success: true, message: 'Password reset email sent.' });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/auth/reset-password/:token ────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: new Date() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

    user.password = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/auth/me ────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ─── @POST /api/auth/resend-otp ───────────────────────────────────────────────
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Already verified.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendEmail({ to: email, subject: 'New OTP - CourseHub', html: `<p>Your new OTP: <strong>${otp}</strong></p>` });
    res.json({ success: true, message: 'OTP resent.' });
  } catch (err) {
    next(err);
  }
};
