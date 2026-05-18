const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const crypto = require('crypto');

// ─── Helper: send token response ──────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// ─── REGISTER USER ────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      isVerified: true
    });

    // Send token response
    sendTokenResponse(user, 201, res);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ─── LOGIN USER ───────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
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

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
exports.adminLogin = async (req, res, next) => {
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

// ─── ADMIN REGISTER ───────────────────────────────────────────────────────────
exports.adminRegister = async (req, res, next) => {
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

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};
