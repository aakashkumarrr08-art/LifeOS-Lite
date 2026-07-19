import createHttpError from '../utils/createHttpError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterInput = (req, _res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (typeof name !== 'string' || !name.trim()) {
    errors.push({ field: 'name', message: 'Name is required.' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
  } else if (name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name must not exceed 50 characters.' });
  }

  if (typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email is required.' });
  } else if (!emailPattern.test(email.trim().toLowerCase())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }

  if (typeof password !== 'string' || !password) {
    errors.push({ field: 'password', message: 'Password is required.' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long.' });
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the highlighted fields.', errors));
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

const validateLoginInput = (req, _res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email is required.' });
  } else if (!emailPattern.test(email.trim().toLowerCase())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }

  if (typeof password !== 'string' || !password) {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the highlighted fields.', errors));
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

export { validateRegisterInput, validateLoginInput };

