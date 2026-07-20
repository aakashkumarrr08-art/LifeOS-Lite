import createHttpError from '../utils/createHttpError.js';
import { calculateStudyDuration, isValidStudyTime } from '../utils/studySessionUtils.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const taskPriorities = ['Low', 'Medium', 'High'];
const taskStatuses = ['Pending', 'In Progress', 'Completed'];
const studySessionStatuses = ['Pending', 'Completed'];
const chatMessageRoles = ['user', 'assistant'];
const MAX_CHAT_HISTORY_ITEMS = 12;
const MAX_CHAT_MESSAGE_LENGTH = 6000;
const MAX_CHAT_HISTORY_CHARACTERS = 12000;

const isWholeNumber = (value) => typeof value === 'number' && Number.isSafeInteger(value);

const normalizeText = (value) => value.trim().replace(/\s+/g, ' ');

const validateRequestBody = (body, allowedFields, errors) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push({ field: 'body', message: 'Request body must be a JSON object.' });
    return false;
  }

  Object.keys(body).forEach((field) => {
    if (!allowedFields.includes(field)) {
      errors.push({ field, message: 'This field is not allowed.' });
    }
  });

  return errors.length === 0;
};

const parseDateOnly = (value) => {
  if (typeof value !== 'string' || !dateOnlyPattern.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  // Midday UTC keeps a date-only value on the same calendar day for most user time zones.
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

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
  const errors = [];

  if (!validateRequestBody(req.body, ['name', 'email', 'password'], errors)) {
    return next(createHttpError(400, 'Please correct the highlighted fields.', errors));
  }

  const { name, email, password } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    errors.push({ field: 'name', message: 'Name is required.' });
  } else if (normalizeText(name).length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
  } else if (normalizeText(name).length > 50) {
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
  } else if (Buffer.byteLength(password, 'utf8') > 72) {
    errors.push({ field: 'password', message: 'Password must not exceed 72 bytes.' });
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the highlighted fields.', errors));
  }

  req.body.name = normalizeText(name);
  req.body.email = email.trim().toLowerCase();
  next();
};

const validateLoginInput = (req, _res, next) => {
  const errors = [];

  if (!validateRequestBody(req.body, ['email', 'password'], errors)) {
    return next(createHttpError(400, 'Please correct the highlighted fields.', errors));
  }

  const { email, password } = req.body;

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
  const errors = [];

  if (
    !validateRequestBody(
      req.body,
      ['title', 'description', 'subject', 'priority', 'status', 'dueDate'],
      errors,
    )
  ) {
    return next(createHttpError(400, 'Please correct the task fields.', errors));
  }

  const { title, description, subject, priority, status, dueDate } = req.body;

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

  const parsedDueDate = parseDateOnly(dueDate);

  if (!parsedDueDate) {
    errors.push({ field: 'dueDate', message: 'A valid due date is required.' });
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the task fields.', errors));
  }

  req.body.title = normalizeText(title);
  req.body.description = description?.trim() || '';
  req.body.subject = normalizeText(subject);
  req.body.dueDate = parsedDueDate.toISOString();
  next();
};

const validateTaskUpdateInput = (req, _res, next) => {
  const allowedFields = ['title', 'description', 'subject', 'priority', 'status', 'dueDate'];
  const errors = [];

  if (!validateRequestBody(req.body, allowedFields, errors)) {
    return next(createHttpError(400, 'Please correct the task fields.', errors));
  }

  const suppliedFields = allowedFields.filter((field) => req.body[field] !== undefined);

  if (suppliedFields.length === 0) {
    errors.push({ field: 'task', message: 'Provide at least one task field to update.' });
  }

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
      errors.push({ field: 'title', message: 'Task title is required.' });
    } else if (req.body.title.trim().length < 2 || req.body.title.trim().length > 120) {
      errors.push({ field: 'title', message: 'Task title must be between 2 and 120 characters.' });
    } else {
      req.body.title = normalizeText(req.body.title);
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
      req.body.subject = normalizeText(req.body.subject);
    }
  }

  if (req.body.priority !== undefined && !taskPriorities.includes(req.body.priority)) {
    errors.push({ field: 'priority', message: 'Priority must be Low, Medium, or High.' });
  }

  if (req.body.status !== undefined && !taskStatuses.includes(req.body.status)) {
    errors.push({ field: 'status', message: 'Status must be Pending, In Progress, or Completed.' });
  }

  if (req.body.dueDate !== undefined) {
    const parsedDueDate = parseDateOnly(req.body.dueDate);

    if (!parsedDueDate) {
      errors.push({ field: 'dueDate', message: 'Provide a valid due date.' });
    } else {
      req.body.dueDate = parsedDueDate.toISOString();
    }
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the task fields.', errors));
  }

  next();
};

const validateAttendanceCreateInput = (req, _res, next) => {
  const errors = [];

  if (
    !validateRequestBody(
      req.body,
      ['subject', 'totalClasses', 'attendedClasses', 'minimumAttendance'],
      errors,
    )
  ) {
    return next(createHttpError(400, 'Please correct the attendance fields.', errors));
  }

  validateAttendanceFields(req.body, errors);

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the attendance fields.', errors));
  }

  next();
};

const validateAttendanceUpdateInput = (req, _res, next) => {
  const allowedFields = ['subject', 'totalClasses', 'attendedClasses', 'minimumAttendance'];
  const errors = [];

  if (!validateRequestBody(req.body, allowedFields, errors)) {
    return next(createHttpError(400, 'Please correct the attendance fields.', errors));
  }

  const suppliedFields = allowedFields.filter((field) => req.body[field] !== undefined);

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
      studySession.subject = normalizeText(subject);
    }
  }

  if (!isUpdate || topic !== undefined) {
    if (typeof topic !== 'string' || !topic.trim()) {
      errors.push({ field: 'topic', message: 'Topic is required.' });
    } else if (topic.trim().length > 120) {
      errors.push({ field: 'topic', message: 'Topic must not exceed 120 characters.' });
    } else {
      studySession.topic = normalizeText(topic);
    }
  }

  if (!isUpdate || date !== undefined) {
    const parsedStudyDate = parseDateOnly(date);

    if (!parsedStudyDate) {
      errors.push({ field: 'date', message: 'A valid study date is required.' });
    } else {
      studySession.date = parsedStudyDate.toISOString();
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

  if (
    !validateRequestBody(
      req.body,
      ['subject', 'topic', 'date', 'startTime', 'endTime', 'priority', 'status', 'notes'],
      errors,
    )
  ) {
    return next(createHttpError(400, 'Please correct the study session fields.', errors));
  }

  validateStudySessionFields(req.body, errors);

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the study session fields.', errors));
  }

  next();
};

const validateStudySessionUpdateInput = (req, _res, next) => {
  const allowedFields = ['subject', 'topic', 'date', 'startTime', 'endTime', 'priority', 'status', 'notes'];
  const errors = [];

  if (!validateRequestBody(req.body, allowedFields, errors)) {
    return next(createHttpError(400, 'Please correct the study session fields.', errors));
  }

  const suppliedFields = allowedFields.filter((field) => req.body[field] !== undefined);

  if (suppliedFields.length === 0) {
    errors.push({ field: 'studySession', message: 'Provide at least one study session field to update.' });
  }

  validateStudySessionFields(req.body, errors, true);

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the study session fields.', errors));
  }

  next();
};

const validateAiRecommendationInput = (req, _res, next) => {
  const errors = [];

  if (req.body === undefined) {
    req.body = {};
  }

  if (!validateRequestBody(req.body, ['subject', 'focusMinutes'], errors)) {
    return next(createHttpError(400, 'Please correct the AI recommendation options.', errors));
  }

  const body = req.body;

  if (body.subject !== undefined) {
    if (typeof body.subject !== 'string' || !body.subject.trim()) {
      errors.push({ field: 'subject', message: 'Subject must be a non-empty string.' });
    } else if (body.subject.trim().length > 80) {
      errors.push({ field: 'subject', message: 'Subject must not exceed 80 characters.' });
    } else {
      body.subject = body.subject.trim();
    }
  }

  if (body.focusMinutes !== undefined) {
    if (!isWholeNumber(body.focusMinutes) || body.focusMinutes < 15 || body.focusMinutes > 180) {
      errors.push({ field: 'focusMinutes', message: 'Focus minutes must be a whole number between 15 and 180.' });
    }
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the AI recommendation options.', errors));
  }

  req.body = body;
  next();
};

const validateAiChatInput = (req, _res, next) => {
  const errors = [];

  if (!validateRequestBody(req.body, ['message', 'history'], errors)) {
    return next(createHttpError(400, 'Please correct the AI chat message.', errors));
  }

  const { history = [], message } = req.body;

  if (typeof message !== 'string' || !message.trim()) {
    errors.push({ field: 'message', message: 'Enter a message before sending it.' });
  } else if (message.trim().length > MAX_CHAT_MESSAGE_LENGTH) {
    errors.push({
      field: 'message',
      message: `Message must not exceed ${MAX_CHAT_MESSAGE_LENGTH} characters.`,
    });
  }

  if (!Array.isArray(history)) {
    errors.push({ field: 'history', message: 'Chat history must be an array.' });
  } else if (history.length > MAX_CHAT_HISTORY_ITEMS) {
    errors.push({
      field: 'history',
      message: `Chat history cannot contain more than ${MAX_CHAT_HISTORY_ITEMS} messages.`,
    });
  }

  const normalizedHistory = [];

  if (Array.isArray(history)) {
    history.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push({ field: `history.${index}`, message: 'Each chat message must be an object.' });
        return;
      }

      if (!chatMessageRoles.includes(entry.role)) {
        errors.push({
          field: `history.${index}.role`,
          message: 'Chat history role must be user or assistant.',
        });
      }

      if (typeof entry.content !== 'string' || !entry.content.trim()) {
        errors.push({
          field: `history.${index}.content`,
          message: 'Chat history content must be a non-empty string.',
        });
      } else if (entry.content.trim().length > MAX_CHAT_MESSAGE_LENGTH) {
        errors.push({
          field: `history.${index}.content`,
          message: `Chat history content must not exceed ${MAX_CHAT_MESSAGE_LENGTH} characters.`,
        });
      } else {
        normalizedHistory.push({
          content: entry.content.trim(),
          role: entry.role,
        });
      }
    });
  }

  const historyCharacterCount = normalizedHistory.reduce(
    (total, entry) => total + entry.content.length,
    0,
  );

  if (historyCharacterCount > MAX_CHAT_HISTORY_CHARACTERS) {
    errors.push({
      field: 'history',
      message: `Chat history must not exceed ${MAX_CHAT_HISTORY_CHARACTERS} characters.`,
    });
  }

  if (errors.length > 0) {
    return next(createHttpError(400, 'Please correct the AI chat message.', errors));
  }

  req.body = {
    history: normalizedHistory,
    message: message.trim(),
  };
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
  validateAiRecommendationInput,
  validateAiChatInput,
};
