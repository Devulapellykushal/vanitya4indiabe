const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register,
  login,
  resetPassword,
  getProfile,
  updateProfile,
  refreshToken
} = require('../controllers/authController');

// Apply auth rate limiting to all routes
router.use(authLimiter);

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/reset', resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/refresh', authenticate, refreshToken);

module.exports = router;