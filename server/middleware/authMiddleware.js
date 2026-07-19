import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import createHttpError from '../utils/createHttpError.js';

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createHttpError(401, 'Authorization token is missing.');
  }

  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, 'JWT_SECRET is not configured on the server.');
  }

  const token = authHeader.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw createHttpError(401, 'The token is valid, but the user no longer exists.');
  }

  req.user = user;
  next();
});

export { protect };

