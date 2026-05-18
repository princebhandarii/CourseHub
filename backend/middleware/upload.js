const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ─── Storage for thumbnails ───────────────────────────────────────────────────
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/thumbnails')),
  filename:    (req, file, cb) => cb(null, `thumb_${uuidv4()}${path.extname(file.originalname)}`),
});

// ─── Storage for videos ────────────────────────────────────────────────────────
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/videos')),
  filename:    (req, file, cb) => cb(null, `video_${uuidv4()}${path.extname(file.originalname)}`),
});

// ─── Storage for avatars ──────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/thumbnails')),
  filename:    (req, file, cb) => cb(null, `avatar_${uuidv4()}${path.extname(file.originalname)}`),
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp) are allowed.'));
  }
};

const videoFilter = (req, file, cb) => {
  const allowed = /mp4|mkv|webm|mov|avi/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (mp4, mkv, webm, mov) are allowed.'));
  }
};

const MAX = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024; // 100MB

exports.uploadThumbnail = multer({ storage: thumbnailStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('thumbnail');
exports.uploadVideo     = multer({ storage: videoStorage,     fileFilter: videoFilter,  limits: { fileSize: MAX } }).single('video');
exports.uploadAvatar    = multer({ storage: avatarStorage,    fileFilter: imageFilter,  limits: { fileSize: 2 * 1024 * 1024 } }).single('avatar');
