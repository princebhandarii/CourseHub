const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const dotenv  = require('dotenv');

const connectDB      = require('./config/db');
const errorHandler   = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow both local dev and deployed Vercel frontend
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now; restrict in production if needed
  },
  methods:      ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:  true,
}));

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logger ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static Uploads (for local videos — thumbnails served via Cloudinary) ─────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/admin',       require('./routes/adminRoutes'));
app.use('/api/courses',     require('./routes/courseRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/contact',     require('./routes/contactRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/payment',     require('./routes/paymentRoutes'));
app.use('/api/progress',    require('./routes/progressRoutes'));
app.use('/api/reviews',     require('./routes/reviewRoutes'));
app.use('/api/wishlist',    require('./routes/wishlistRoutes'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CourseHub API running', timestamp: new Date() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
// Use Render's PORT env variable automatically
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`✅  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
