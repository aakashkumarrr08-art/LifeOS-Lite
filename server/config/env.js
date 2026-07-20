import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const parseOrigins = (value) =>
  (value || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isPlaceholderSecret = (value) =>
  !value || value.toLowerCase().includes('replace_with') || value.length < 32;

const config = {
  clientOrigins: parseOrigins(process.env.CLIENT_URL),
  environment: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGO_URI,
  port: Number(process.env.PORT) || 5000,
  trustProxy: process.env.TRUST_PROXY === 'true',
  upcomingExam: {
    courseCode: process.env.UPCOMING_EXAM_COURSE_CODE || '',
    date: process.env.UPCOMING_EXAM_DATE || '',
    title: process.env.UPCOMING_EXAM_TITLE || '',
    venue: process.env.UPCOMING_EXAM_VENUE || '',
  },
};

const validateServerConfig = () => {
  const errors = [];

  if (!config.mongoUri) {
    errors.push('MONGO_URI is required.');
  }

  if (isPlaceholderSecret(config.jwtSecret)) {
    errors.push('JWT_SECRET must be a non-placeholder value of at least 32 characters.');
  }

  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('PORT must be a valid network port.');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid server configuration: ${errors.join(' ')}`);
  }
};

export { config, validateServerConfig };
