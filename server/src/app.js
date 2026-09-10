import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { notFound } from './middleware/notFound.js';
import { noStore } from './middleware/noStore.js';
import { requestOriginGuard } from './middleware/requestOriginGuard.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '250kb' }));
app.use(express.urlencoded({ extended: false, limit: '250kb' }));
app.use(cookieParser());
app.use('/api', requestOriginGuard);

const privateApiPrefixes = [
  '/api/auth',
  '/api/invitations',
  '/api/admin',
  '/api/doctor',
  '/api/student',
  '/api/parent',
  '/api/account',
  '/api/notifications',
];

for (const prefix of privateApiPrefixes) {
  app.use(prefix, noStore);
}

app.use('/api', apiLimiter);
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
