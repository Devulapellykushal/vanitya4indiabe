const rateLimit = require('express-rate-limit');
const config = require('../config');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: config.get('RATE_LIMIT_WINDOW_MS'),
  max: config.get('RATE_LIMIT_MAX_REQUESTS'),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

// Rate limiting for ML service calls
const mlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 ML requests per minute
  message: {
    error: 'Too many ML service requests, please try again later.'
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  mlLimiter
};