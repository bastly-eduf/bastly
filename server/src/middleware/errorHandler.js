import { env } from '../config/env.js';

function normalizeStatus(error) {
  const candidate = Number(error?.status || error?.statusCode || 500);

  if (
    Number.isInteger(candidate) &&
    candidate >= 400 &&
    candidate <= 599
  ) {
    return candidate;
  }

  return 500;
}

export function errorHandler(error, req, res, next) {
  const requestId = req.requestId || 'unavailable';

  if (error?.code === 11000) {
    return res.status(409).json({
      error: 'That value is already in use.',
      requestId,
    });
  }

  const status = normalizeStatus(error);

  if (status >= 500) {
    // Deliberately never log request bodies, cookies, Authorization headers,
    // or the query string because account links can contain secret tokens.
    console.error('[Bastly API error]', {
      requestId,
      method: req.method,
      path: req.path,
      name: error?.name || 'Error',
      message: error?.message || 'Unknown server error',
      stack: error?.stack,
    });
  }

  return res.status(status).json({
    error:
      status >= 500
        ? 'Internal server error'
        : error?.message || 'Request failed.',
    requestId,
    ...(status < 500 && error?.details && { details: error.details }),
    ...(env.nodeEnv === 'development' &&
      status >= 500 && { stack: error?.stack }),
  });
}
