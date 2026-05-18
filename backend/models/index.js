const mongoose = require('mongoose');

// ─── Enrollment ────────────────────────────────────────────────────────────────
const enrollmentSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt:   { type: Date, default: Date.now },
  completed:    { type: Boolean, default: false },
  completedAt:  { type: Date },
  paymentId:    { type: String, default: '' },
  amountPaid:   { type: Number, default: 0 },
}, { timestamps: true });

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// ─── Wishlist ──────────────────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

wishlistSchema.index({ user: 1 }, { unique: true });

// ─── Progress ──────────────────────────────────────────────────────────────────
const progressSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  video:        { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  watchedTime:  { type: Number, default: 0 },   // seconds watched
  duration:     { type: Number, default: 0 },   // total video duration
  completed:    { type: Boolean, default: false },
  lastWatched:  { type: Date, default: Date.now },
}, { timestamps: true });

progressSchema.index({ user: 1, video: 1 }, { unique: true });

// ─── Review ────────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { timestamps: true });

reviewSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = {
  Enrollment: mongoose.model('Enrollment', enrollmentSchema),
  Wishlist:   mongoose.model('Wishlist', wishlistSchema),
  Progress:   mongoose.model('Progress', progressSchema),
  Review:     mongoose.model('Review', reviewSchema),
};
