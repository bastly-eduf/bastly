import { env } from '../config/env.js';

export function errorHandler(error, req, res, next) {
  if (error?.code === 11000) {
    return res.status(409).json({
      error: 'That value is already in use.',
    });
  }

  const status = error.status || error.statusCode || 500;

  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({
    error: status === 500 ? 'Internal server error' : error.message,
    ...(error.details && { details: error.details }),
    ...(env.nodeEnv === 'development' && status >= 500 && { stack: error.stack }),
  });
}
