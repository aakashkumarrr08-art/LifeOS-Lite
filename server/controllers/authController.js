import mongoose from 'mongoose';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import createHttpError from '../utils/createHttpError.js';
import generateToken from '../utils/generateToken.js';

const ensureDatabaseConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw createHttpError(
      503,
      'Database connection is not ready. Configure MongoDB and restart the server.',
    );
  }
};

const buildAuthResponse = (user, message) => ({
  success: true,
  message,
  token: generateToken(user._id),
  user: user.toJSON(),
});

const registerUser = asyncHandler(async (req, res) => {
  ensureDatabaseConnection();

  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json(buildAuthResponse(user, 'Account created successfully.'));
});

const loginUser = asyncHandler(async (req, res) => {
  ensureDatabaseConnection();

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw createHttpError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password.');
  }

  res.status(200).json(buildAuthResponse(user, 'Login successful.'));
});

const getUserProfile = asyncHandler(async (req, res) => {
  ensureDatabaseConnection();

  res.status(200).json({
    success: true,
    message: 'Profile fetched successfully.',
    user: req.user.toJSON(),
  });
});

export { registerUser, loginUser, getUserProfile };

