const express = require('express');
const { middleware } = require('../../core');

// Import route modules
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');
const sttRoutes = require('./routes/stt');
const adminRoutes = require('./routes/admin');
const recommenderRoutes = require('./routes/recommender');

const router = express.Router();

/**
 * API v1 routes configuration
 */

// Authentication routes with specific rate limiting
router.use('/auth', middleware.RateLimitingMiddleware.createAuthLimiter(), authRoutes);

// Protected routes (require authentication)
router.use('/exercises', exerciseRoutes);
router.use('/stt', middleware.RateLimitingMiddleware.createUploadLimiter(), sttRoutes);
router.use('/recommender', recommenderRoutes);

// Admin routes (require admin privileges)
router.use('/admin', adminRoutes);

// API v1 info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Vanitya Backend API v1',
    version: '1.0.0',
    endpoints: [
      'GET /auth/me',
      'POST /auth/register',
      'POST /auth/login',
      'POST /auth/logout',
      'GET /exercises',
      'POST /exercises',
      'GET /exercises/:id',
      'POST /stt/transcribe',
      'GET /recommender/suggest',
      'GET /admin/users',
      'GET /admin/analytics'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;