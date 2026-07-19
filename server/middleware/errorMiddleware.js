const notFoundHandler = (req, res, next) => {
  res.status(404);
  const error = new Error(`Route not found: ${req.originalUrl}`);
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error.',
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};

export { notFoundHandler, errorHandler };
