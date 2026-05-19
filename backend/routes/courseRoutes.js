const express = require('express');
const r = express.Router();
const c = require('../controllers/courseController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadThumbnail, uploadVideo } = require('../middleware/upload');

// Public
r.get('/',                    c.getCourses);
r.get('/categories',          c.getCategories);
r.get('/admin/all',           protect, adminOnly, c.getAdminCourses);
r.get('/:id',                 c.getCourse);

// Admin CRUD
r.post('/',                   protect, adminOnly, uploadThumbnail, c.createCourse);
r.put('/:id',                 protect, adminOnly, uploadThumbnail, c.updateCourse);
r.delete('/:id',              protect, adminOnly, c.deleteCourse);
r.patch('/:id/publish',       protect, adminOnly, c.togglePublish);

// Sections & Videos
// Sections & Videos
r.post('/:id/sections',                                protect, adminOnly, c.addSection);
r.put('/:id/sections/:sectionId',                      protect, adminOnly, c.updateSection);
r.delete('/:id/sections/:sectionId',                   protect, adminOnly, c.deleteSection);
r.post('/:id/sections/:sectionId/videos',              protect, adminOnly, uploadVideo, c.addVideo);
r.delete('/:id/sections/:sectionId/videos/:videoId',   protect, adminOnly, c.deleteVideo);

module.exports = r;
