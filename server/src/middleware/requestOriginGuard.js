import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const SAFE_METHODS = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
]);

export function requestOriginGuard(
  req,
  res,
  next,
) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get('origin');

  // Browser writes made by the Bastly frontend should always carry Origin.
  // Local development still permits tools such as Postman/curl without it.
  if (!origin) {
    if (env.isProduction) {
      return next(
        new HttpError(
          403,
          'Request origin is required.',
        ),
      );
    }

    return next();
  }

  if (origin !== env.clientOrigin) {
    return next(
      new HttpError(
        403,
        'Request origin is not allowed.',
      ),
    );
  }

  return next();
}
