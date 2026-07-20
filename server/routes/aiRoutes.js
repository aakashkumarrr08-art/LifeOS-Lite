import { Router } from 'express';
import {
  createProductivityTips,
  createRevisionPlan,
  createStudyPlan,
  getDashboardSummary,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateAiRecommendationInput } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/dashboard-summary', getDashboardSummary);
router.post('/study-plan', validateAiRecommendationInput, createStudyPlan);
router.post('/revision-plan', validateAiRecommendationInput, createRevisionPlan);
router.post('/productivity-tips', validateAiRecommendationInput, createProductivityTips);

export default router;
