// backend/routes/contactRoutes.js

const express = require('express');

const router = express.Router();

// ✅ Import controller
const {
  sendContact,
} = require('../controllers/contactController');

// ✅ Public contact route
router.post('/', sendContact);

// ✅ Export router
module.exports = router;
