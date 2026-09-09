import User from '../models/User.js';
import { AUTH_COOKIE, verifyAuthToken } from '../utils/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE];

  if (!token) {
    throw new HttpError(401, 'Authentication required.');
  }

  let payload;

  try {
    payload = verifyAuthToken(token);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please log in again.');
  }

  const user = await User.findById(payload.sub).select('+tokenVersion');

  if (!user || user.status !== 'active') {
    throw new HttpError(401, 'This account is not available.');
  }

  if ((user.tokenVersion || 0) !== payload.tv) {
    throw new HttpError(401, 'Your session is no longer valid. Please log in again.');
  }

  req.user = user;
  next();
});
