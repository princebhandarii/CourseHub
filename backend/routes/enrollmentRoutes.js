const express = require('express');
const r = express.Router();
const c = require('../controllers/actionsController');
const { protect } = require('../middleware/auth');

r.post('/:courseId',         protect, c.enroll);
r.get('/my',                 protect, c.getMyEnrollments);
r.get('/check/:courseId',    protect, c.checkEnrollment);
module.exports = r;
