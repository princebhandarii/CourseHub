// ─── Auth Routes ─────────────────────────────────────────────────────────────
const express = require('express');
const r = express.Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');

r.post('/register',        c.register);
r.post('/login',           c.login);
r.post('/admin/login',     c.adminLogin);
r.post('/admin/register',  c.adminRegister);
r.post('/verify-otp',      c.verifyOTP);
r.post('/resend-otp',      c.resendOTP);
r.post('/forgot-password', c.forgotPassword);
r.put('/reset-password/:token', c.resetPassword);
r.get('/me',               protect, c.getMe);

module.exports = r;
