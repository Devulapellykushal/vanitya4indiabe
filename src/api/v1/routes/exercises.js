const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { mlLimiter } = require('../middleware/rateLimiter');
const {
  fetchExercises,
  submitExercise,
  generateExercises,
  generateAudio,
  getExercise
} = require('../controllers/exerciseController');

// All exercise routes require authentication
router.use(authenticate);

// Routes
router.get('/fetch', fetchExercises);
router.post('/submit', submitExercise);
router.post('/generate', mlLimiter, generateExercises);
router.post('/:id/audio', mlLimiter, generateAudio);
router.get('/:id', getExercise);

module.exports = router;