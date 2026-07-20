import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import asyncHandler from '../utils/asyncHandler.js';
import { formatAttendanceRecord } from '../utils/attendanceMetrics.js';
import createHttpError from '../utils/createHttpError.js';

const ensureValidAttendanceId = (attendanceId) => {
  if (!mongoose.isValidObjectId(attendanceId)) {
    throw createHttpError(400, 'Invalid attendance record id.');
  }
};

const ensureAttendanceIsPossible = (attendance) => {
  if (attendance.attendedClasses > attendance.totalClasses) {
    throw createHttpError(400, 'Attended classes cannot exceed total classes.');
  }
};

const createAttendance = asyncHandler(async (req, res) => {
  const { subject, totalClasses, attendedClasses, minimumAttendance } = req.body;
  const attendance = await Attendance.create({
    userId: req.user._id,
    subject,
    totalClasses,
    attendedClasses,
    minimumAttendance,
  });

  res.status(201).json({
    success: true,
    message: 'Attendance record created successfully.',
    attendance: formatAttendanceRecord(attendance),
  });
});

const getAttendanceRecords = asyncHandler(async (req, res) => {
  const attendanceRecords = await Attendance.find({ userId: req.user._id }).sort({ subject: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    attendanceRecords: attendanceRecords.map(formatAttendanceRecord),
  });
});

const getAttendanceById = asyncHandler(async (req, res) => {
  ensureValidAttendanceId(req.params.id);

  const attendance = await Attendance.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!attendance) {
    throw createHttpError(404, 'Attendance record not found.');
  }

  res.status(200).json({
    success: true,
    attendance: formatAttendanceRecord(attendance),
  });
});

const updateAttendance = asyncHandler(async (req, res) => {
  ensureValidAttendanceId(req.params.id);

  const attendance = await Attendance.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!attendance) {
    throw createHttpError(404, 'Attendance record not found.');
  }

  const allowedFields = ['subject', 'totalClasses', 'attendedClasses', 'minimumAttendance'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      attendance[field] = req.body[field];
    }
  });

  ensureAttendanceIsPossible(attendance);
  await attendance.save();

  res.status(200).json({
    success: true,
    message: 'Attendance record updated successfully.',
    attendance: formatAttendanceRecord(attendance),
  });
});

const deleteAttendance = asyncHandler(async (req, res) => {
  ensureValidAttendanceId(req.params.id);

  const attendance = await Attendance.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!attendance) {
    throw createHttpError(404, 'Attendance record not found.');
  }

  res.status(200).json({
    success: true,
    message: 'Attendance record deleted successfully.',
  });
});

export {
  createAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};
