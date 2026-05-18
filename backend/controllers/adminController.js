const User = require('../models/User');
const Course = require('../models/Course');
const { Enrollment, Review } = require('../models/index');

// ─── @GET /api/admin/dashboard ────────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.aggregate([{ $group: { _id: null, total: { $sum: '$amountPaid' } } }]),
    ]);

    // Monthly enrollments (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEnrollments = await Enrollment.aggregate([
      { $match: { enrolledAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$enrolledAt' }, month: { $month: '$enrolledAt' } },
          count:   { $sum: 1 },
          revenue: { $sum: '$amountPaid' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top courses by enrollment
    const topCourses = await Enrollment.aggregate([
      { $group: { _id: '$course', enrollments: { $sum: 1 } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { enrollments: 1, 'course.title': 1, 'course.thumbnail': 1, 'course.price': 1 } },
    ]);

    // Recent users
    const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt avatar');

    // Category distribution
    const categoryStats = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      monthlyEnrollments,
      topCourses,
      recentUsers,
      categoryStats,
    });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/admin/users ────────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, isBlocked } = req.query;
    const query = { role: 'user' };
    if (search)    query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    res.json({ success: true, users, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/admin/users  (admin creates user manually) ───────────────────
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role: 'user', isVerified: true });
    user.password = undefined;
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── @PATCH /api/admin/users/:id/block ───────────────────────────────────────
exports.toggleBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'User not found.' });
    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, isBlocked: user.isBlocked, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}.` });
  } catch (err) {
    next(err);
  }
};

// ─── @DELETE /api/admin/users/:id ────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'User not found.' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/admin/courses/:id/students ────────────────────────────────────
exports.getCourseStudents = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.id })
      .populate('user', 'name email avatar lastLogin')
      .sort({ enrolledAt: -1 });
    res.json({ success: true, enrollments });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/admin/analytics ───────────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    // Revenue by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const revenueData = await Enrollment.aggregate([
      { $match: { enrolledAt: { $gte: twelveMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$enrolledAt' }, month: { $month: '$enrolledAt' } },
          revenue: { $sum: '$amountPaid' },
          enrollments: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const userGrowth = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: twelveMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, revenueData, userGrowth });
  } catch (err) {
    next(err);
  }
};
