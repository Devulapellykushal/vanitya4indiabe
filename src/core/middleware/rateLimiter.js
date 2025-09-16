const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Enhanced rate limiting middleware with different strategies
 */
class RateLimitingMiddleware {
  static createApiLimiter() {
    return rateLimit({
      windowMs: config.rateLimiting.windowMs,
      max: config.rateLimiting.maxRequests,
      message: {
        success: false,
        error: {
          message: 'Too many requests from this IP, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(config.rateLimiting.windowMs / 1000)
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: config.rateLimiting.skipSuccessfulRequests,
      skipFailedRequests: config.rateLimiting.skipFailedRequests,
      keyGenerator: (req) => {
        return req.ip;
      },
      onLimitReached: (req, res) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}`, {
          requestId: req.id,
          url: req.url,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  static createAuthLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
      message: {
        success: false,
        error: {
          message: 'Too many authentication attempts, please try again later.',
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          retryAfter: 900 // 15 minutes
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true
    });
  }

  static createUploadLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // Limit each IP to 10 uploads per minute
      message: {
        success: false,
        error: {
          message: 'Too many upload attempts, please try again later.',
          code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
          retryAfter: 60
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  static createUserBasedLimiter(maxRequests = 1000, windowMs = 60 * 60 * 1000) {
    return rateLimit({
      windowMs,
      max: maxRequests,
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?.id || req.ip;
      },
      message: {
        success: false,
        error: {
          message: 'Request quota exceeded for this user.',
          code: 'USER_RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000)
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }
}

module.exports = RateLimitingMiddleware;