const config = require('../config');

/**
 * Centralized error handling middleware with proper error categorization
 */
class ErrorHandler {
  static handle() {
    return (err, req, res, next) => {
      // Log error details
      console.error(`Error in ${req.method} ${req.url}:`, {
        requestId: req.id,
        error: err.message,
        stack: config.isDevelopment() ? err.stack : undefined,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      // Determine error type and response
      const errorResponse = this.categorizeError(err);
      
      res.status(errorResponse.status).json({
        success: false,
        error: {
          message: errorResponse.message,
          code: errorResponse.code,
          requestId: req.id,
          timestamp: new Date().toISOString(),
          ...(config.isDevelopment() && err.stack ? { stack: err.stack } : {})
        }
      });
    };
  }

  static categorizeError(err) {
    // Validation errors
    if (err.name === 'ValidationError' || err.isJoi) {
      return {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: err.message || 'Validation failed'
      };
    }

    // Authentication errors
    if (err.name === 'UnauthorizedError' || err.status === 401) {
      return {
        status: 401,
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required'
      };
    }

    // Authorization errors
    if (err.status === 403) {
      return {
        status: 403,
        code: 'AUTHORIZATION_ERROR',
        message: 'Insufficient permissions'
      };
    }

    // Not found errors
    if (err.status === 404) {
      return {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Resource not found'
      };
    }

    // Rate limiting errors
    if (err.status === 429) {
      return {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please try again later.'
      };
    }

    // Database errors
    if (err.name === 'SequelizeError' || err.parent?.code) {
      return this.handleDatabaseError(err);
    }

    // External API errors
    if (err.isAxiosError || err.response) {
      return this.handleExternalApiError(err);
    }

    // Default server error
    return {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: config.isProduction() ? 'Internal server error' : err.message
    };
  }

  static handleDatabaseError(err) {
    const code = err.parent?.code || err.original?.code;
    
    switch (code) {
      case '23505': // Unique constraint violation
        return {
          status: 409,
          code: 'DUPLICATE_ENTRY',
          message: 'Resource already exists'
        };
      case '23503': // Foreign key constraint violation
        return {
          status: 400,
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Referenced resource does not exist'
        };
      case '23502': // Not null constraint violation
        return {
          status: 400,
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Required field is missing'
        };
      default:
        return {
          status: 500,
          code: 'DATABASE_ERROR',
          message: config.isProduction() ? 'Database operation failed' : err.message
        };
    }
  }

  static handleExternalApiError(err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message;

    return {
      status: status >= 500 ? 503 : status,
      code: 'EXTERNAL_API_ERROR',
      message: config.isProduction() ? 'External service error' : message
    };
  }

  static notFound() {
    return (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          message: `Route ${req.method} ${req.url} not found`,
          code: 'NOT_FOUND',
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });
    };
  }

  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;