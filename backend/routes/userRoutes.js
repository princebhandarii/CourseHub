const express = require('express');
const r = express.Router();
const uc = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

r.get('/profile',         protect, uc.getProfile);
r.put('/profile',         protect, uploadAvatar, uc.updateProfile);
r.put('/change-password', protect, uc.changePassword);
module.exports = r;
