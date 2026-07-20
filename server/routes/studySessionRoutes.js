import { Router } from 'express';
import {
  createStudySession,
  deleteStudySession,
  getStudySessionById,
  getStudySessions,
  updateStudySession,
} from '../controllers/studySessionController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateStudySessionCreateInput,
  validateStudySessionUpdateInput,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').post(validateStudySessionCreateInput, createStudySession).get(getStudySessions);
router
  .route('/:id')
  .get(getStudySessionById)
  .put(validateStudySessionUpdateInput, updateStudySession)
  .delete(deleteStudySession);

export default router;
