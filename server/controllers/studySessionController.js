import mongoose from 'mongoose';
import StudySession from '../models/StudySession.js';
import asyncHandler from '../utils/asyncHandler.js';
import createHttpError from '../utils/createHttpError.js';
import { calculateStudyDuration } from '../utils/studySessionUtils.js';

const ensureValidStudySessionId = (studySessionId) => {
  if (!mongoose.isValidObjectId(studySessionId)) {
    throw createHttpError(400, 'Invalid study session id.');
  }
};

const createStudySession = asyncHandler(async (req, res) => {
  const {
    subject,
    topic,
    date,
    startTime,
    endTime,
    duration,
    priority,
    status,
    notes,
  } = req.body;
  const studySession = await StudySession.create({
    subject,
    topic,
    date,
    startTime,
    endTime,
    duration,
    priority,
    status,
    notes,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Study session created successfully.',
    studySession,
  });
});

const getStudySessions = asyncHandler(async (req, res) => {
  const studySessions = await StudySession.find({ userId: req.user._id }).sort({
    date: 1,
    startTime: 1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: studySessions.length,
    studySessions,
  });
});

const getStudySessionById = asyncHandler(async (req, res) => {
  ensureValidStudySessionId(req.params.id);

  const studySession = await StudySession.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!studySession) {
    throw createHttpError(404, 'Study session not found.');
  }

  res.status(200).json({
    success: true,
    studySession,
  });
});

const updateStudySession = asyncHandler(async (req, res) => {
  ensureValidStudySessionId(req.params.id);

  const studySession = await StudySession.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!studySession) {
    throw createHttpError(404, 'Study session not found.');
  }

  const allowedFields = ['subject', 'topic', 'date', 'startTime', 'endTime', 'priority', 'status', 'notes'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      studySession[field] = req.body[field];
    }
  });

  const duration = calculateStudyDuration(studySession.startTime, studySession.endTime);

  if (!duration) {
    throw createHttpError(400, 'End time must be later than start time.');
  }

  studySession.duration = duration;
  await studySession.save();

  res.status(200).json({
    success: true,
    message: 'Study session updated successfully.',
    studySession,
  });
});

const deleteStudySession = asyncHandler(async (req, res) => {
  ensureValidStudySessionId(req.params.id);

  const studySession = await StudySession.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!studySession) {
    throw createHttpError(404, 'Study session not found.');
  }

  res.status(200).json({
    success: true,
    message: 'Study session deleted successfully.',
  });
});

export {
  createStudySession,
  getStudySessions,
  getStudySessionById,
  updateStudySession,
  deleteStudySession,
};
