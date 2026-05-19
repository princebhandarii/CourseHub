const express = require('express');
const r = express.Router();
const c = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

r.post('/order/:courseId', protect, c.createOrder);
r.post('/verify',          protect, c.verifyPayment);

module.exports = r;