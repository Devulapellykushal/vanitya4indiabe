const LoggingMiddleware = require('./logging');
const ErrorHandler = require('./errorHandler');
const RateLimitingMiddleware = require('./rateLimiter');
const MetricsMiddleware = require('./metrics');

/**
 * Centralized middleware exports
 */
module.exports = {
  LoggingMiddleware,
  ErrorHandler,
  RateLimitingMiddleware,
  MetricsMiddleware
};