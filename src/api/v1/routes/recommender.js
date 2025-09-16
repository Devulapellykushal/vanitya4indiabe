const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getNextExercise,
  recordFeedback,
  getAnalytics
} = require('../controllers/recommenderController');

// All recommender routes require authentication
router.use(authenticate);

// Routes
router.get('/next', getNextExercise);
router.post('/feedback', recordFeedback);
router.get('/analytics', getAnalytics);

module.exports = router;