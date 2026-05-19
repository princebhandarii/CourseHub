const multer  = require('multer');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ─── Cloudinary storage for thumbnails ───────────────────────────────────────
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'coursehub/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 800, height: 450, crop: 'fill', quality: 'auto' }],
    public_id:       () => `thumb_${uuidv4()}`,
  },
});

// ─── Cloudinary storage for avatars ──────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'coursehub/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }],
    public_id:       () => `avatar_${uuidv4()}`,
  },
});

// ─── Local disk storage for videos ───────────────────────────────────────────
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadPath = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, `video_${uuidv4()}${path.extname(file.originalname)}`),
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
    cb(new Error('Only video files are allowed.'));
  }
};

const MAX = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024;

exports.uploadThumbnail = multer({ storage: thumbnailStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('thumbnail');
exports.uploadVideo     = multer({ storage: videoStorage,     fileFilter: videoFilter,  limits: { fileSize: MAX } }).single('video');
exports.uploadAvatar    = multer({ storage: avatarStorage,    fileFilter: imageFilter,  limits: { fileSize: 2 * 1024 * 1024 } }).single('avatar');
