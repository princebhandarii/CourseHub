const express = require('express');
const r = express.Router();

const {
  register,
  login,
  adminLogin,
  adminRegister,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// ─── User Routes ─────────────────────────────
r.post('/register', register);
r.post('/login', login);

// Forgot Password
r.post('/forgot-password', forgotPassword);

// Reset Password
r.put('/reset-password/:token', resetPassword);

// ─── Admin Routes ────────────────────────────
r.post('/admin/login', adminLogin);
r.post('/admin/register', adminRegister);

// ─── Current User ────────────────────────────
r.get('/me', protect, getMe);

module.exports = r;
