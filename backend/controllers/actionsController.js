const { Enrollment, Progress, Review, Wishlist } = require('../models/index');
const Course = require('../models/Course');
const Video  = require('../models/Video');
const User   = require('../models/User');

// ═══════════════════════════════════════════════════════════════
//  ENROLLMENT
// ═══════════════════════════════════════════════════════════════

// @POST /api/enrollments/:courseId
exports.enroll = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || !course.isPublished)
      return res.status(404).json({ success: false, message: 'Course not available.' });

    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing)
      return res.status(400).json({ success: false, message: 'Already enrolled.' });

    const enrollment = await Enrollment.create({
      user:      req.user._id,
      course:    course._id,
      amountPaid: course.price,
    });

    await Course.findByIdAndUpdate(course._id, { $inc: { enrollmentCount: 1 } });

    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    next(err);
  }
};

// @GET /api/enrollments/my
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'sections', populate: { path: 'videos', select: 'title duration order' } },
      })
      .sort({ enrolledAt: -1 });

    // Attach progress percentage for each course
    const data = await Promise.all(enrollments.map(async (en) => {
      if (!en.course) return { ...en.toObject(), progressPercent: 0 };
      const totalVideos = en.course.totalLectures || 0;
      if (totalVideos === 0) return { ...en.toObject(), progressPercent: 0 };
      const completed = await Progress.countDocuments({ user: req.user._id, course: en.course._id, completed: true });
      const percent = Math.round((completed / totalVideos) * 100);
      return { ...en.toObject(), progressPercent: percent };
    }));

    res.json({ success: true, enrollments: data });
  } catch (err) {
    next(err);
  }
};

// @GET /api/enrollments/check/:courseId
exports.checkEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
    res.json({ success: true, enrolled: !!enrollment });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  PROGRESS
// ═══════════════════════════════════════════════════════════════

// @PUT /api/progress
exports.updateProgress = async (req, res, next) => {
  try {
    const { courseId, videoId, watchedTime, duration } = req.body;

    const completed = duration > 0 && watchedTime / duration >= 0.9;

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, video: videoId },
      { course: courseId, watchedTime, duration, completed, lastWatched: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, progress });
  } catch (err) {
    next(err);
  }
};

// @GET /api/progress/:courseId
exports.getCourseProgress = async (req, res, next) => {
  try {
    const progressList = await Progress.find({ user: req.user._id, course: req.params.courseId });
    const completed    = progressList.filter(p => p.completed).length;
    const total        = await Video.countDocuments({ course: req.params.courseId });
    const percent      = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ success: true, progressList, percent, completed, total });
  } catch (err) {
    next(err);
  }
};

// @GET /api/progress/continue
exports.getContinueLearning = async (req, res, next) => {
  try {
    const recent = await Progress.find({ user: req.user._id })
      .sort({ lastWatched: -1 })
      .limit(5)
      .populate('video', 'title duration thumbnail')
      .populate('course', 'title thumbnail');

    res.json({ success: true, recent });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════════════════════

// @POST /api/reviews/:courseId
exports.addReview = async (req, res, next) => {
  try {
    const enrolled = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
    if (!enrolled) return res.status(403).json({ success: false, message: 'Enroll in the course first.' });

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, course: req.params.courseId },
      { rating: req.body.rating, comment: req.body.comment },
      { upsert: true, new: true, runValidators: true }
    );

    // Recalculate course rating
    const stats = await Review.aggregate([
      { $match: { course: review.course } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      await Course.findByIdAndUpdate(req.params.courseId, {
        rating:      Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count,
      });
    }

    const populated = await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review: populated });
  } catch (err) {
    next(err);
  }
};

// @GET /api/reviews/:courseId
exports.getCourseReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  WISHLIST
// ═══════════════════════════════════════════════════════════════

// @GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('courses');
    res.json({ success: true, courses: wishlist?.courses || [] });
  } catch (err) {
    next(err);
  }
};

// @POST /api/wishlist/:courseId
exports.toggleWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, courses: [] });

    const idx = wishlist.courses.indexOf(req.params.courseId);
    let added;
    if (idx > -1) {
      wishlist.courses.splice(idx, 1);
      added = false;
    } else {
      wishlist.courses.push(req.params.courseId);
      added = true;
    }
    await wishlist.save();
    res.json({ success: true, added, message: added ? 'Added to wishlist.' : 'Removed from wishlist.' });
  } catch (err) {
    next(err);
  }
};
