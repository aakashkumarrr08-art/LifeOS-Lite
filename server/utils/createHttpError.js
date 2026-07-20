const createHttpError = (statusCode, message, errors = [], exposeMessage = false) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.exposeMessage = exposeMessage;
  error.errors = errors;
  return error;
};

export default createHttpError;
