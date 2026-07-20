import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { apiRateLimiter } from './middleware/securityMiddleware.js';

const app = express();

app.disable('x-powered-by');

if (config.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('This origin is not allowed by the API CORS policy.'));
    },
  }),
);
app.use(helmet());
app.use(morgan(config.environment === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LifeOS Lite API is running.',
  });
});

app.use('/api', apiRateLimiter, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
