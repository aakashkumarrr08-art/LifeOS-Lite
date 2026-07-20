import { Router } from 'express';
import {
  getUserProfile,
  loginUser,
  registerUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/securityMiddleware.js';
import {
  validateLoginInput,
  validateRegisterInput,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/register', authRateLimiter, validateRegisterInput, registerUser);
router.post('/login', authRateLimiter, validateLoginInput, loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
