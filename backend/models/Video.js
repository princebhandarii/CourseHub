const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  url:         { type: String, required: true },        // file path or stream URL
  duration:    { type: Number, default: 0 },            // seconds
  order:       { type: Number, default: 0 },
  section:     { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  isFree:      { type: Boolean, default: false },       // preview video
  thumbnail:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
