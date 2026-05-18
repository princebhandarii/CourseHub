const express = require('express');
const r = express.Router();
const c = require('../controllers/actionsController');
const { protect } = require('../middleware/auth');

r.post('/:courseId', protect, c.addReview);
r.get('/:courseId',          c.getCourseReviews);
module.exports = r;
