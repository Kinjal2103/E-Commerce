/**
 * Custom Error Handlers & Middleware Module
 * Consolidates the AppError class, async controller wrapper,
 * global error processing middleware, and route-not-found handlers.
 */

/**
 * AppError Class - Custom operational error extension of native Error
 */
class AppError extends Error {
  /**
   * @param {string} message - Error description message
   * @param {number} statusCode - HTTP status code (400, 404, 500, etc.)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marks as anticipated/expected operational error

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * catchAsync Wrapper - Eliminates redundant try-catch blocks in controller handlers
 * @param {Function} fn - Asynchronous route controller function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Global Error Handling Middleware
 * Catch all thrown errors and format into a consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use another value.`;
    error = new AppError(message, 400);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(el => el.message).join(' ');
    error = new AppError(message, 400);
  }

  // Handle JWT invalid signature error
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  // Handle JWT token expired error
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired! Please log in again.', 401);
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Standard JSON response structure
  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

/**
 * Not Found Middleware (404)
 * Triggers when request hits an undefined routing endpoint
 */
const notFound = (req, res, next) => {
  next(new AppError(`Cannot find routing path ${req.originalUrl} on this server`, 404));
};

module.exports = {
  AppError,
  catchAsync,
  errorHandler,
  notFound
};
