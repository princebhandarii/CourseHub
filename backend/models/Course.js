const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  description:    { type: String, required: true },
  shortDesc:      { type: String, default: '' },
  thumbnail:      { type: String, default: '' },
  price:          { type: Number, required: true, default: 0 },
  originalPrice:  { type: Number, default: 0 },
  category:       { type: String, required: true },
  level:          { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
  language:       { type: String, default: 'English' },
  duration:       { type: String, default: '0h 0m' },          // e.g. "12h 30m"
  totalLectures:  { type: Number, default: 0 },
  isPublished:    { type: Boolean, default: false },
  isFeatured:     { type: Boolean, default: false },
  tags:           [{ type: String }],
  requirements:   [{ type: String }],
  whatYouLearn:   [{ type: String }],
  instructor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enrollmentCount:{ type: Number, default: 0 },
  rating:         { type: Number, default: 0 },
  ratingCount:    { type: Number, default: 0 },
  sections:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
}, { timestamps: true });

// Text search index
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
