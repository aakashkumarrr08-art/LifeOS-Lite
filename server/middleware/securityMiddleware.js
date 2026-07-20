import rateLimit from 'express-rate-limit';

const rateLimitMessage = (message) => ({
  success: false,
  message,
});

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: rateLimitMessage('Too many requests. Please try again in a few minutes.'),
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: rateLimitMessage('Too many authentication attempts. Please try again in 15 minutes.'),
});

const aiChatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: rateLimitMessage('Too many AI chat messages. Please try again in a few minutes.'),
});

export { aiChatRateLimiter, apiRateLimiter, authRateLimiter };
