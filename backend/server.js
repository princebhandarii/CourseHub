// backend/server.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();


// ─────────────────────────────────────────────────────────────
// CORS FIX
// ─────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://course-hub-peach.vercel.app',
  ],

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
}));

// IMPORTANT
app.options('*', cors());


// ─────────────────────────────────────────────────────────────
// BODY PARSER
// ─────────────────────────────────────────────────────────────

app.use(express.json({
  limit: '10mb',
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));


// ─────────────────────────────────────────────────────────────
// LOGGER
// ─────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// ─────────────────────────────────────────────────────────────
// STATIC UPLOADS
// ─────────────────────────────────────────────────────────────

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);


// ─────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/admin', require('./routes/adminRoutes'));

app.use('/api/courses', require('./routes/courseRoutes'));

app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/contact', require('./routes/contactRoutes'));

app.use('/api/enrollments', require('./routes/enrollmentRoutes'));

app.use('/api/payment', require('./routes/paymentRoutes'));

app.use('/api/progress', require('./routes/progressRoutes'));

app.use('/api/reviews', require('./routes/reviewRoutes'));

app.use('/api/wishlist', require('./routes/wishlistRoutes'));


// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {

  res.json({
    status: 'ok',
    message: 'CourseHub API running',
    timestamp: new Date(),
  });

});


// ─────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────

app.use(errorHandler);


// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {

  console.log(
    `✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );

});


module.exports = app;
