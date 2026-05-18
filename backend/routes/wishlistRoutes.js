const express = require('express');
const r = express.Router();
const c = require('../controllers/actionsController');
const { protect } = require('../middleware/auth');

r.get('/',               protect, c.getWishlist);
r.post('/:courseId',     protect, c.toggleWishlist);
module.exports = r;
