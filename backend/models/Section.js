const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  course:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  order:    { type: Number, default: 0 },
  videos:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);
