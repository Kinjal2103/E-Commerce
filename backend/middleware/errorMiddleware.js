class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use another value.`;
    error = new AppError(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(el => el.message).join(' ');
    error = new AppError(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired! Please log in again.', 401);
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`Cannot find routing path ${req.originalUrl} on this server`, 404));
};

module.exports = {
  AppError,
  catchAsync,
  errorHandler,
  notFound
};
