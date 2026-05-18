const express = require('express');
const r = express.Router();
const c = require('../controllers/actionsController');
const { protect } = require('../middleware/auth');

r.put('/',              protect, c.updateProgress);
r.get('/continue',      protect, c.getContinueLearning);
r.get('/:courseId',     protect, c.getCourseProgress);
module.exports = r;
