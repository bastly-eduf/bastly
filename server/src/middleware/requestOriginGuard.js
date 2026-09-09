import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function requestOriginGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get('origin');

  // Browser cross-site requests include Origin. Reject any browser state-changing
  // request that did not originate from the configured Bastly frontend.
  if (origin && origin !== env.clientUrl) {
    return next(new HttpError(403, 'Request origin is not allowed.'));
  }

  return next();
}
