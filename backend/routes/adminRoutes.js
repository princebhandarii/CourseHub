const express = require('express');
const r = express.Router();
const ac = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

r.use(protect, adminOnly);
r.get('/dashboard',            ac.getDashboard);
r.get('/analytics',            ac.getAnalytics);
r.get('/users',                ac.getUsers);
r.post('/users',               ac.createUser);
r.patch('/users/:id/block',    ac.toggleBlock);
r.delete('/users/:id',         ac.deleteUser);
r.get('/courses/:id/students', ac.getCourseStudents);
module.exports = r;
