const Course  = require('../models/Course');
const Section = require('../models/Section');
const Video   = require('../models/Video');
const { Enrollment } = require('../models/index');
const path    = require('path');
const fs      = require('fs');

// ─── @GET /api/courses  (public, with search/filter/pagination) ───────────────
exports.getCourses = async (req, res, next) => {
  try {
    const { search, category, level, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    let query = { isPublished: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (level)    query.level = level;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt:  1 },
      priceAsc: { price:  1 },
      priceDsc: { price: -1 },
      popular:  { enrollmentCount: -1 },
      rating:   { rating: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate('instructor', 'name avatar')
      .select('-sections');

    res.json({
      success: true,
      count:   courses.length,
      total,
      pages:   Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      courses,
    });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/courses/:id  (public) ─────────────────────────────────────────
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate({
        path: 'sections',
        populate: { path: 'videos', select: 'title duration isFree order url description' },
      });

    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/courses  (admin) ──────────────────────────────────────────────
exports.createCourse = async (req, res, next) => {
  try {
    const data = { ...req.body, instructor: req.user._id };

    if (req.file) data.thumbnail = req.file.path;

    // Parse JSON strings from form data
    ['tags', 'requirements', 'whatYouLearn'].forEach(field => {
      if (typeof data[field] === 'string') {
        try { data[field] = JSON.parse(data[field]); } catch {}
      }
    });

    const course = await Course.create(data);
    res.status(201).json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/courses/:id  (admin) ──────────────────────────────────────────
exports.updateCourse = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.thumbnail = req.file.path;

    ['tags', 'requirements', 'whatYouLearn'].forEach(field => {
      if (typeof updates[field] === 'string') {
        try { updates[field] = JSON.parse(updates[field]); } catch {}
      }
    });

    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// ─── @DELETE /api/courses/:id  (admin) ───────────────────────────────────────
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    // Delete associated videos & sections
    const sections = await Section.find({ course: course._id });
    for (const sec of sections) {
      const videos = await Video.find({ section: sec._id });
      for (const vid of videos) {
        const filePath = path.join(__dirname, '..', vid.url.replace('/uploads', 'uploads'));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await Video.deleteMany({ section: sec._id });
    }
    await Section.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });

    if (course.thumbnail) {
      const thumbPath = path.join(__dirname, '..', course.thumbnail.replace('/uploads', 'uploads'));
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/courses/:id/sections  (admin) ─────────────────────────────────
exports.addSection = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const order   = course.sections.length;
    const section = await Section.create({ title: req.body.title, course: course._id, order });

    course.sections.push(section._id);
    await course.save();

    res.status(201).json({ success: true, section });
  } catch (err) {
    next(err);
  }
};

// ─── @POST /api/courses/:id/sections/:sectionId/videos  (admin) ──────────────
exports.addVideo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file uploaded.' });

    const section = await Section.findById(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found.' });

    const order = section.videos.length;
    const video = await Video.create({
      title:    req.body.title || req.file.originalname,
      description: req.body.description || '',
      url:      `/uploads/videos/${req.file.filename}`,
      duration: Number(req.body.duration) || 0,
      isFree:   req.body.isFree === 'true',
      order,
      section:  section._id,
      course:   req.params.id,
    });

    section.videos.push(video._id);
    await section.save();

    // Update total lecture count on course
    await Course.findByIdAndUpdate(req.params.id, { $inc: { totalLectures: 1 } });

    res.status(201).json({ success: true, video });
  } catch (err) {
    next(err);
  }
};

// ─── @DELETE /api/courses/:id/sections/:sectionId/videos/:videoId ─────────────
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });

    const filePath = path.join(__dirname, '..', video.url.replace('/uploads', 'uploads'));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Section.findByIdAndUpdate(req.params.sectionId, { $pull: { videos: video._id } });
    await Course.findByIdAndUpdate(req.params.id, { $inc: { totalLectures: -1 } });
    await video.deleteOne();

    res.json({ success: true, message: 'Video deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/courses/admin/all  (admin - includes unpublished) ──────────────
exports.getAdminCourses = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = search ? { $text: { $search: search } } : {};
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('instructor', 'name');

    res.json({ success: true, courses, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

// ─── @PATCH /api/courses/:id/publish  (admin) ─────────────────────────────────
exports.togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ success: true, isPublished: course.isPublished });
  } catch (err) {
    next(err);
  }
};

// ─── @PUT /api/courses/:id/sections/:sectionId  (admin) ──────────────────────
exports.updateSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found.' });

    section.title = req.body.title || section.title;
    await section.save();

    res.json({ success: true, section });
  } catch (err) {
    next(err);
  }
};

// ─── @DELETE /api/courses/:id/sections/:sectionId  (admin) ───────────────────
exports.deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found.' });

    // Delete all videos inside this section
    const videos = await Video.find({ section: section._id });
    for (const vid of videos) {
      const filePath = path.join(__dirname, '..', vid.url.replace('/uploads', 'uploads'));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Video.deleteMany({ section: section._id });

    // Remove section ref from course
    await Course.findByIdAndUpdate(req.params.id, {
      $pull: { sections: section._id },
      $inc:  { totalLectures: -videos.length },
    });

    await section.deleteOne();
    res.json({ success: true, message: 'Section deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── @GET /api/courses/categories  (public) ───────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};
