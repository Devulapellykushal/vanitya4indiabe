/**
 * Base exception class for all custom application errors
 */
class BaseException extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Validation-related exceptions (400)
 */
class ValidationException extends BaseException {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Authentication-related exceptions (401)
 */
class AuthenticationException extends BaseException {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization-related exceptions (403)
 */
class AuthorizationException extends BaseException {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Resource not found exceptions (404)
 */
class NotFoundException extends BaseException {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict exceptions (409)
 */
class ConflictException extends BaseException {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Rate limiting exceptions (429)
 */
class RateLimitException extends BaseException {
  constructor(retryAfter = 900) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

/**
 * External service exceptions (502/503)
 */
class ExternalServiceException extends BaseException {
  constructor(service, message = 'External service error', statusCode = 503) {
    super(`${service}: ${message}`, statusCode, 'EXTERNAL_SERVICE_ERROR', { service });
  }
}

/**
 * Business logic exceptions (422)
 */
class BusinessLogicException extends BaseException {
  constructor(message, details = null) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', details);
  }
}

/**
 * Database operation exceptions (500)
 */
class DatabaseException extends BaseException {
  constructor(message = 'Database operation failed', details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

module.exports = {
  BaseException,
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  NotFoundException,
  ConflictException,
  RateLimitException,
  ExternalServiceException,
  BusinessLogicException,
  DatabaseException
};