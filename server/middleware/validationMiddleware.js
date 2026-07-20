import createHttpError from '../utils/createHttpError.js';
import { calculateStudyDuration, isValidStudyTime } from '../utils/studySessionUtils.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const taskPriorities = ['Low', 'Medium', 'High'];
const taskStatuses = ['Pending', 'In Progress', 'Completed'];
const studySessionStatuses = ['Pending', 'Completed'];

const isWholeNumber = (value) => typeof value === 'number' && Number.isSafeInteger(value);

const validateAttendanceFields = (attendance, errors, isUpdate = false) => {
  const { subject, totalClasses, attendedClasses, minimumAttendance } = attendance;

  if (!isUpdate || subject !== undefined) {
    if (typeof subject !== 'string' || !subject.trim()) {
      errors.push({ field: 'subject', message: 'Subject is required.' });
    } else if (subject.trim().length > 80) {
      errors.push({ field: 'subject', message: 'Subject must not exceed 80 characters.' });
    } else {
      attendance.subject = subject.trim();
    }
  }

  if (!isUpdate || totalClasses !== undefined) {
    if (!isWholeNumber(totalClasses) || totalClasses < 1) {
      errors.push({ field: 'totalClasses', message: 'Total classes must be a whole number of at least 1.' });
    }
  }

  if (!isUpdate || attendedClasses !== undefined) {
    if (!isWholeNumber(attendedClasses) || attendedClasses < 0) {
      errors.push({ field: 'attendedClasses', message: 'Attended classes must be a whole number of at least 0.' });
    }
  }

  if (minimumAttendance !== undefined) {
    if (typeof minimumAttendance !== 'number' || !Number.isFinite(minimumAttendance)) {
      errors.push({ field: 'minimumAttendance', message: 'Minimum attendance must be a valid percentage.' });
    } else if (minimumAttendance < 1 || minimumAttendance > 100) {
      errors.push({ field: 'minimumAttendance', message: 'Minimum attendance must be between 1% and 100%.' });
    }
  }

  if (
    totalClasses !== undefined &&
    attendedClasses !== undefined &&
    isWholeNumber(totalClasses) &&
    isWholeNumber(attendedClasses) &&
    attendedClasses > totalClasses
  ) {
    errors.push({ field: 'attendedClasses', message: 'Attended classes cannot exceed total classes.' });
  }
};

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

const validateAttendanceCreateInput = (req, _res, next) => {
  const errors = [];

  validateAttendanceFields(req.body, errors);

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the attendance fields.', errors));
  }

  next();
};

const validateAttendanceUpdateInput = (req, _res, next) => {
  const allowedFields = ['subject', 'totalClasses', 'attendedClasses', 'minimumAttendance'];
  const suppliedFields = allowedFields.filter((field) => req.body[field] !== undefined);
  const errors = [];

  if (suppliedFields.length === 0) {
    errors.push({ field: 'attendance', message: 'Provide at least one attendance field to update.' });
  }

  validateAttendanceFields(req.body, errors, true);

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the attendance fields.', errors));
  }

  next();
};

const validateStudySessionFields = (studySession, errors, isUpdate = false) => {
  const { subject, topic, date, startTime, endTime, priority, status, notes } = studySession;

  if (!isUpdate || subject !== undefined) {
    if (typeof subject !== 'string' || !subject.trim()) {
      errors.push({ field: 'subject', message: 'Subject is required.' });
    } else if (subject.trim().length > 80) {
      errors.push({ field: 'subject', message: 'Subject must not exceed 80 characters.' });
    } else {
      studySession.subject = subject.trim();
    }
  }

  if (!isUpdate || topic !== undefined) {
    if (typeof topic !== 'string' || !topic.trim()) {
      errors.push({ field: 'topic', message: 'Topic is required.' });
    } else if (topic.trim().length > 120) {
      errors.push({ field: 'topic', message: 'Topic must not exceed 120 characters.' });
    } else {
      studySession.topic = topic.trim();
    }
  }

  if (!isUpdate || date !== undefined) {
    if (typeof date !== 'string' || !date || Number.isNaN(new Date(date).getTime())) {
      errors.push({ field: 'date', message: 'A valid study date is required.' });
    } else {
      studySession.date = new Date(date).toISOString();
    }
  }

  if (!isUpdate || startTime !== undefined) {
    if (!isValidStudyTime(startTime)) {
      errors.push({ field: 'startTime', message: 'Start time must use the HH:mm format.' });
    }
  }

  if (!isUpdate || endTime !== undefined) {
    if (!isValidStudyTime(endTime)) {
      errors.push({ field: 'endTime', message: 'End time must use the HH:mm format.' });
    }
  }

  if (priority !== undefined && !taskPriorities.includes(priority)) {
    errors.push({ field: 'priority', message: 'Priority must be Low, Medium, or High.' });
  }

  if (status !== undefined && !studySessionStatuses.includes(status)) {
    errors.push({ field: 'status', message: 'Status must be Pending or Completed.' });
  }

  if (!isUpdate || notes !== undefined) {
    if (notes !== undefined && (typeof notes !== 'string' || notes.trim().length > 500)) {
      errors.push({ field: 'notes', message: 'Notes must not exceed 500 characters.' });
    } else {
      studySession.notes = notes?.trim() || '';
    }
  }

  if (
    startTime !== undefined &&
    endTime !== undefined &&
    isValidStudyTime(startTime) &&
    isValidStudyTime(endTime)
  ) {
    const duration = calculateStudyDuration(startTime, endTime);

    if (!duration) {
      errors.push({ field: 'endTime', message: 'End time must be later than start time.' });
    } else {
      studySession.duration = duration;
    }
  }
};

const validateStudySessionCreateInput = (req, _res, next) => {
  const errors = [];

  validateStudySessionFields(req.body, errors);

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the study session fields.', errors));
  }

  next();
};

const validateStudySessionUpdateInput = (req, _res, next) => {
  const allowedFields = ['subject', 'topic', 'date', 'startTime', 'endTime', 'priority', 'status', 'notes'];
  const suppliedFields = allowedFields.filter((field) => req.body[field] !== undefined);
  const errors = [];

  if (suppliedFields.length === 0) {
    errors.push({ field: 'studySession', message: 'Provide at least one study session field to update.' });
  }

  validateStudySessionFields(req.body, errors, true);

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the study session fields.', errors));
  }

  next();
};

export {
  validateRegisterInput,
  validateLoginInput,
  validateTaskCreateInput,
  validateTaskUpdateInput,
  validateAttendanceCreateInput,
  validateAttendanceUpdateInput,
  validateStudySessionCreateInput,
  validateStudySessionUpdateInput,
};
