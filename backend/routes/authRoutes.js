// ─── Auth Routes ─────────────────────────────────────────────────────────────
const express = require('express');
const r = express.Router();

const {
  register,
  login,
  adminLogin,
  adminRegister,
  getMe
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// User Routes
r.post('/register', register);
r.post('/login', login);

// Admin Routes
r.post('/admin/login', adminLogin);
r.post('/admin/register', adminRegister);

// Current User
r.get('/me', protect, getMe);

module.exports = r;
