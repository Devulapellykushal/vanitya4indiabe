const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal server error',
    status: err.status || 500
  };

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    error.status = 400;
    error.message = 'Validation error';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.status = 409;
    error.message = 'Resource already exists';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Joi validation errors
  if (err.isJoi) {
    error.status = 400;
    error.message = 'Validation error';
    error.details = err.details.map(d => ({
      field: d.context.key,
      message: d.message
    }));
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};