const express = require('express');
const r = express.Router();
const { sendContact } = require('../controllers/contactController');

// Public — no auth needed
r.post('/', sendContact);

module.exports = r;