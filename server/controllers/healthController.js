const getHealthStatus = (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LifeOS Lite API is healthy.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};

export { getHealthStatus };

