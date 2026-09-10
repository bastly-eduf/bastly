import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req, res) => {
  res.set(
    'Cache-Control',
    'no-store, max-age=0',
  );

  const databaseConnected =
    mongoose.connection.readyState === 1;

  return res
    .status(databaseConnected ? 200 : 503)
    .json({
      status: databaseConnected
        ? 'ok'
        : 'degraded',
      service: 'bastly-api',
      database: databaseConnected
        ? 'connected'
        : 'disconnected',
      timestamp: new Date().toISOString(),
    });
});

export default router;
