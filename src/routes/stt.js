const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { mlLimiter } = require('../middleware/rateLimiter');
const {
  submitAudio,
  getSupportedLanguages,
  upload
} = require('../controllers/sttController');

// All STT routes require authentication
router.use(authenticate);

// Routes
router.post('/submit', mlLimiter, upload.single('audioFile'), submitAudio);
router.get('/languages', getSupportedLanguages);

module.exports = router;