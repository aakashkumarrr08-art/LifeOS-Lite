import { generateAiChatResponse } from '../services/aiChatService.js';
import asyncHandler from '../utils/asyncHandler.js';

const chatWithAi = asyncHandler(async (req, res) => {
  const response = await generateAiChatResponse({
    history: req.body.history,
    message: req.body.message,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'AI chat response generated successfully.',
    data: response,
  });
});

export { chatWithAi };
