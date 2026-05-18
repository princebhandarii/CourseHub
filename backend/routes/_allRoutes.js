// adminRoutes.js
const express = require('express');
const adminRouter = express.Router();
const ac = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

adminRouter.use(protect, adminOnly);
adminRouter.get('/dashboard',            ac.getDashboard);
adminRouter.get('/analytics',            ac.getAnalytics);
adminRouter.get('/users',                ac.getUsers);
adminRouter.post('/users',               ac.createUser);
adminRouter.patch('/users/:id/block',    ac.toggleBlock);
adminRouter.delete('/users/:id',         ac.deleteUser);
adminRouter.get('/courses/:id/students', ac.getCourseStudents);

// userRoutes.js
const userRouter = express.Router();
const uc = require('../controllers/userController');
const { uploadAvatar } = require('../middleware/upload');

userRouter.get('/profile',          protect, uc.getProfile);
userRouter.put('/profile',          protect, uploadAvatar, uc.updateProfile);
userRouter.put('/change-password',  protect, uc.changePassword);

// enrollmentRoutes.js
const enrollRouter = express.Router();
const ec = require('../controllers/actionsController');

enrollRouter.post('/:courseId',   protect, ec.enroll);
enrollRouter.get('/my',           protect, ec.getMyEnrollments);
enrollRouter.get('/check/:courseId', protect, ec.checkEnrollment);

// progressRoutes.js
const progressRouter = express.Router();
progressRouter.put('/',            protect, ec.updateProgress);
progressRouter.get('/continue',    protect, ec.getContinueLearning);
progressRouter.get('/:courseId',   protect, ec.getCourseProgress);

// reviewRoutes.js
const reviewRouter = express.Router();
reviewRouter.post('/:courseId',    protect, ec.addReview);
reviewRouter.get('/:courseId',     ec.getCourseReviews);

// wishlistRoutes.js
const wishlistRouter = express.Router();
wishlistRouter.get('/',            protect, ec.getWishlist);
wishlistRouter.post('/:courseId',  protect, ec.toggleWishlist);

module.exports = {
  adminRoutes:    adminRouter,
  userRoutes:     userRouter,
  enrollmentRoutes: enrollRouter,
  progressRoutes: progressRouter,
  reviewRoutes:   reviewRouter,
  wishlistRoutes: wishlistRouter,
};
