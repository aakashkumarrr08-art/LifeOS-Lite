import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import Attendance from '../models/Attendance.js';
import StudySession from '../models/StudySession.js';
import Task from '../models/Task.js';
import { buildAcademicContext, buildAiDashboardSummary } from '../services/aiService.js';
import {
  validateAiRecommendationInput,
  validateRegisterInput,
  validateStudySessionCreateInput,
  validateTaskCreateInput,
} from '../middleware/validationMiddleware.js';
import generateToken from '../utils/generateToken.js';

const runMiddleware = (middleware, body) =>
  new Promise((resolve) => {
    const request = { body };
    middleware(request, {}, (error) => resolve({ error, request }));
  });

test('task completion timestamps are maintained from the task status', async () => {
  const completedTask = new Task({
    dueDate: new Date('2026-08-20T12:00:00.000Z'),
    status: 'Completed',
    subject: 'Database Systems',
    title: 'Finish normalization notes',
    userId: '507f1f77bcf86cd799439011',
  });

  await completedTask.validate();
  assert.ok(completedTask.completedAt instanceof Date);

  completedTask.status = 'Pending';
  await completedTask.validate();
  assert.equal(completedTask.completedAt, null);
});

test('study duration is derived from valid start and end times', async () => {
  const studySession = new StudySession({
    date: new Date('2026-08-20T12:00:00.000Z'),
    duration: 999,
    endTime: '11:15',
    startTime: '10:00',
    subject: 'Algorithms',
    topic: 'Graph traversal',
    userId: '507f1f77bcf86cd799439011',
  });

  await studySession.validate();
  assert.equal(studySession.duration, 75);
});

test('attendance rejects more attended classes than total classes', async () => {
  const attendance = new Attendance({
    attendedClasses: 11,
    subject: 'Operating Systems',
    totalClasses: 10,
    userId: '507f1f77bcf86cd799439011',
  });

  await assert.rejects(attendance.validate(), /Attended classes cannot exceed total classes/);
});

test('task validation rejects unknown fields and impossible calendar dates', async () => {
  const unknownFieldResult = await runMiddleware(validateTaskCreateInput, {
    dueDate: '2026-08-20',
    subject: 'Database Systems',
    title: 'Write SQL queries',
    userId: '507f1f77bcf86cd799439011',
  });
  const invalidDateResult = await runMiddleware(validateTaskCreateInput, {
    dueDate: '2026-02-30',
    subject: 'Database Systems',
    title: 'Write SQL queries',
  });

  assert.equal(unknownFieldResult.error.statusCode, 400);
  assert.equal(invalidDateResult.error.statusCode, 400);
});

test('study validation calculates a valid calendar date and duration', async () => {
  const result = await runMiddleware(validateStudySessionCreateInput, {
    date: '2026-08-20',
    endTime: '11:30',
    startTime: '10:00',
    subject: 'Algorithms',
    topic: 'Graph traversal',
  });

  assert.equal(result.error, undefined);
  assert.equal(result.request.body.duration, 90);
  assert.equal(result.request.body.date, '2026-08-20T12:00:00.000Z');
});

test('AI recommendations accept an omitted options body', async () => {
  const result = await runMiddleware(validateAiRecommendationInput, undefined);

  assert.equal(result.error, undefined);
  assert.deepEqual(result.request.body, {});
});

test('registration validation normalizes names and guards bcrypt input length', async () => {
  const validResult = await runMiddleware(validateRegisterInput, {
    email: 'STUDENT@example.com',
    name: '  Student   Name  ',
    password: 'secure-password',
  });
  const oversizedPasswordResult = await runMiddleware(validateRegisterInput, {
    email: 'student@example.com',
    name: 'Student Name',
    password: 'a'.repeat(73),
  });

  assert.equal(validResult.error, undefined);
  assert.equal(validResult.request.body.name, 'Student Name');
  assert.equal(validResult.request.body.email, 'student@example.com');
  assert.equal(oversizedPasswordResult.error.statusCode, 400);
});

test('generated JWTs use the expected signed payload', () => {
  const originalSecret = process.env.JWT_SECRET;
  const jwtSecret = 'unit_test_jwt_secret_that_is_long_enough_2026';
  process.env.JWT_SECRET = jwtSecret;

  try {
    const token = generateToken('507f1f77bcf86cd799439011');
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    assert.equal(decoded.userId, '507f1f77bcf86cd799439011');
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  }
});

test('AI recommendations are built only from the supplied academic context', () => {
  const context = buildAcademicContext({
    attendanceRecords: [
      {
        attendedClasses: 6,
        minimumAttendance: 75,
        subject: 'Networks',
        totalClasses: 10,
      },
    ],
    now: new Date('2026-08-20T10:00:00.000Z'),
    studySessions: [],
    tasks: [
      {
        dueDate: new Date('2026-08-20T12:00:00.000Z'),
        priority: 'High',
        status: 'Pending',
        subject: 'Networks',
        title: 'Complete routing worksheet',
      },
    ],
  });
  const summary = buildAiDashboardSummary(context);

  assert.equal(summary.engine, 'rule-based');
  assert.equal(summary.highestPrioritySubject.subject, 'Networks');
  assert.equal(summary.pendingTaskReminder.count, 1);
});
