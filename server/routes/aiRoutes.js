import { Router } from 'express';
import {
  createProductivityTips,
  createRevisionPlan,
  createStudyPlan,
  getDashboardSummary,
} from '../controllers/aiController.js';
import { chatWithAi } from '../controllers/aiChatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiChatRateLimiter } from '../middleware/securityMiddleware.js';
import {
  validateAiChatInput,
  validateAiRecommendationInput,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/dashboard-summary', getDashboardSummary);
router.post('/study-plan', validateAiRecommendationInput, createStudyPlan);
router.post('/revision-plan', validateAiRecommendationInput, createRevisionPlan);
router.post('/productivity-tips', validateAiRecommendationInput, createProductivityTips);
router.post('/chat', aiChatRateLimiter, validateAiChatInput, chatWithAi);

export default router;
