/**
 * Error taxonomy for standardized error handling
 */

/**
 * Provider API Error
 */
class ProviderError extends Error {
  constructor(provider, operation, statusCode, message) {
    super(`[${provider}] ${operation} failed (${statusCode}): ${message}`);
    this.name = 'ProviderError';
    this.provider = provider;
    this.operation = operation;
    this.statusCode = statusCode;
  }
}

/**
 * Credits Error
 */
class CreditsError extends Error {
  constructor(provider, operation, available, required) {
    super(`[${provider}] Insufficient credits for ${operation}: ${available} available, ${required} required`);
    this.name = 'CreditsError';
    this.provider = provider;
    this.operation = operation;
    this.available = available;
    this.required = required;
  }
}

/**
 * Validation Error
 */
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

module.exports = {
  ProviderError,
  CreditsError,
  ValidationError
};