const notFoundHandler = (req, res, next) => {
  res.status(404);
  const error = new Error(`Route not found: ${req.originalUrl}`);
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  if (error.code === 11000) {
    res.status(409).json({
      success: false,
      message:
        Object.keys(error.keyPattern || {}).includes('email')
          ? 'An account with this email already exists.'
          : 'A record with this value already exists.',
    });
    return;
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Your session is invalid or has expired. Please log in again.',
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Please correct the invalid fields.',
      errors: Object.values(error.errors).map((validationError) => ({
        field: validationError.path,
        message: validationError.message,
      })),
    });
    return;
  }

  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Invalid ${error.path}.`,
    });
    return;
  }

  const statusCode = error.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error.',
    errors: Array.isArray(error.errors) && error.errors.length > 0 ? error.errors : undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};

export { notFoundHandler, errorHandler };
