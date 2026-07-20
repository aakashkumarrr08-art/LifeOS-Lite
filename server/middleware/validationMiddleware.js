import createHttpError from '../utils/createHttpError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const taskPriorities = ['Low', 'Medium', 'High'];
const taskStatuses = ['Pending', 'In Progress', 'Completed'];

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

const validateTaskCreateInput = (req, _res, next) => {
  const { title, description, subject, priority, status, dueDate } = req.body;
  const errors = [];

  if (typeof title !== 'string' || !title.trim()) {
    errors.push({ field: 'title', message: 'Task title is required.' });
  } else if (title.trim().length < 2 || title.trim().length > 120) {
    errors.push({ field: 'title', message: 'Task title must be between 2 and 120 characters.' });
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim().length > 500)) {
    errors.push({ field: 'description', message: 'Description must not exceed 500 characters.' });
  }

  if (typeof subject !== 'string' || !subject.trim()) {
    errors.push({ field: 'subject', message: 'Subject is required.' });
  } else if (subject.trim().length > 80) {
    errors.push({ field: 'subject', message: 'Subject must not exceed 80 characters.' });
  }

  if (priority !== undefined && !taskPriorities.includes(priority)) {
    errors.push({ field: 'priority', message: 'Priority must be Low, Medium, or High.' });
  }

  if (status !== undefined && !taskStatuses.includes(status)) {
    errors.push({ field: 'status', message: 'Status must be Pending, In Progress, or Completed.' });
  }

  if (typeof dueDate !== 'string' || !dueDate || Number.isNaN(new Date(dueDate).getTime())) {
    errors.push({ field: 'dueDate', message: 'A valid due date is required.' });
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the task fields.', errors));
  }

  req.body.title = title.trim();
  req.body.description = description?.trim() || '';
  req.body.subject = subject.trim();
  req.body.dueDate = new Date(dueDate).toISOString();
  next();
};

const validateTaskUpdateInput = (req, _res, next) => {
  const allowedFields = ['title', 'description', 'subject', 'priority', 'status', 'dueDate'];
  const suppliedFields = allowedFields.filter((field) => req.body[field] !== undefined);
  const errors = [];

  if (suppliedFields.length === 0) {
    errors.push({ field: 'task', message: 'Provide at least one task field to update.' });
  }

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
      errors.push({ field: 'title', message: 'Task title is required.' });
    } else if (req.body.title.trim().length < 2 || req.body.title.trim().length > 120) {
      errors.push({ field: 'title', message: 'Task title must be between 2 and 120 characters.' });
    } else {
      req.body.title = req.body.title.trim();
    }
  }

  if (req.body.description !== undefined) {
    if (typeof req.body.description !== 'string' || req.body.description.trim().length > 500) {
      errors.push({ field: 'description', message: 'Description must not exceed 500 characters.' });
    } else {
      req.body.description = req.body.description.trim();
    }
  }

  if (req.body.subject !== undefined) {
    if (typeof req.body.subject !== 'string' || !req.body.subject.trim()) {
      errors.push({ field: 'subject', message: 'Subject is required.' });
    } else if (req.body.subject.trim().length > 80) {
      errors.push({ field: 'subject', message: 'Subject must not exceed 80 characters.' });
    } else {
      req.body.subject = req.body.subject.trim();
    }
  }

  if (req.body.priority !== undefined && !taskPriorities.includes(req.body.priority)) {
    errors.push({ field: 'priority', message: 'Priority must be Low, Medium, or High.' });
  }

  if (req.body.status !== undefined && !taskStatuses.includes(req.body.status)) {
    errors.push({ field: 'status', message: 'Status must be Pending, In Progress, or Completed.' });
  }

  if (req.body.dueDate !== undefined) {
    if (typeof req.body.dueDate !== 'string' || Number.isNaN(new Date(req.body.dueDate).getTime())) {
      errors.push({ field: 'dueDate', message: 'Provide a valid due date.' });
    } else {
      req.body.dueDate = new Date(req.body.dueDate).toISOString();
    }
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the task fields.', errors));
  }

  next();
};

export {
  validateRegisterInput,
  validateLoginInput,
  validateTaskCreateInput,
  validateTaskUpdateInput,
};
