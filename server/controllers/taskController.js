import mongoose from 'mongoose';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import createHttpError from '../utils/createHttpError.js';

const ensureValidTaskId = (taskId) => {
  if (!mongoose.isValidObjectId(taskId)) {
    throw createHttpError(400, 'Invalid task id.');
  }
};

const createTask = asyncHandler(async (req, res) => {
  const { title, description, subject, priority, status, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    subject,
    priority,
    status,
    dueDate,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    task,
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id }).sort({ dueDate: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  ensureValidTaskId(req.params.id);

  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw createHttpError(404, 'Task not found.');
  }

  res.status(200).json({
    success: true,
    task,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  ensureValidTaskId(req.params.id);

  const { title, description, subject, priority, status, dueDate } = req.body;
  const updates = {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(subject !== undefined && { subject }),
    ...(priority !== undefined && { priority }),
    ...(status !== undefined && { status }),
    ...(dueDate !== undefined && { dueDate }),
  };

  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id,
    },
    updates,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!task) {
    throw createHttpError(404, 'Task not found.');
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  ensureValidTaskId(req.params.id);

  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw createHttpError(404, 'Task not found.');
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
  });
});

export { createTask, getTasks, getTaskById, updateTask, deleteTask };

