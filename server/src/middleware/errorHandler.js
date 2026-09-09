import { env } from '../config/env.js';

export function errorHandler(error, req, res, next) {
  console.error(error);

  const status = error.status || error.statusCode || 500;

  res.status(status).json({
    error: status === 500 ? 'Internal server error' : error.message,
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  });
}
