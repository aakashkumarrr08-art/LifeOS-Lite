const createHttpError = (statusCode, message, errors = []) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.errors = errors;
  return error;
};

export default createHttpError;
