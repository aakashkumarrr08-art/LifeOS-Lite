import mongoose from 'mongoose';

const getHealthStatus = (_req, res) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;

  res.status(isDatabaseReady ? 200 : 503).json({
    success: isDatabaseReady,
    message: isDatabaseReady ? 'LifeOS Lite API is healthy.' : 'Database connection is unavailable.',
    database: isDatabaseReady ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};

export { getHealthStatus };
