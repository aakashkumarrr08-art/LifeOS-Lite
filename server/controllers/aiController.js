import asyncHandler from '../utils/asyncHandler.js';
import {
  getAiDashboardSummary,
  getAiProductivityTips,
  getAiRevisionPlan,
  getAiStudyPlan,
} from '../services/aiService.js';

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await getAiDashboardSummary(req.user._id);

  res.status(200).json({
    success: true,
    message: 'AI dashboard summary generated successfully.',
    data: summary,
  });
});

const createStudyPlan = asyncHandler(async (req, res) => {
  const studyPlan = await getAiStudyPlan(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'AI study plan generated successfully.',
    data: studyPlan,
  });
});

const createRevisionPlan = asyncHandler(async (req, res) => {
  const revisionPlan = await getAiRevisionPlan(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'AI revision plan generated successfully.',
    data: revisionPlan,
  });
});

const createProductivityTips = asyncHandler(async (req, res) => {
  const productivityTips = await getAiProductivityTips(req.user._id);

  res.status(200).json({
    success: true,
    message: 'AI productivity tips generated successfully.',
    data: productivityTips,
  });
});

export {
  getDashboardSummary,
  createStudyPlan,
  createRevisionPlan,
  createProductivityTips,
};
