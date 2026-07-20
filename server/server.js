import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import { config, validateServerConfig } from './config/env.js';

let httpServer;

const startServer = async () => {
  try {
    validateServerConfig();
    await connectDB();

    httpServer = app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

const shutdown = (signal) => {
  console.log(`${signal} received. Closing LifeOS Lite server.`);

  const forceExitTimer = setTimeout(() => process.exit(1), 10000);
  forceExitTimer.unref();

  const closeDatabase = () =>
    mongoose.connection.readyState === 0 ? Promise.resolve() : mongoose.connection.close(false);

  if (!httpServer) {
    closeDatabase().finally(() => process.exit(0));
    return;
  }

  httpServer.close(() => {
    closeDatabase().finally(() => process.exit(0));
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
