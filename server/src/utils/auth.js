import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// __Host- cookies cannot specify Domain, must use Path=/, and must be Secure.
// Keeping the simpler name in development preserves localhost HTTP behavior.
export const AUTH_COOKIE = env.isProduction
  ? '__Host-bastly_session'
  : 'bastly_session';

const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
const JWT_ALGORITHM = 'HS256';

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      tv: user.tokenVersion || 0,
    },
    env.jwtSecret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: '7d',
      issuer: 'bastly-api',
      audience: 'bastly-web',
    },
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    algorithms: [JWT_ALGORITHM],
    issuer: 'bastly-api',
    audience: 'bastly-web',
  });
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    priority: 'high',
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  };
}

export function clearAuthCookieOptions() {
  return {
    httpOnly: true,
    priority: 'high',
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
  };
}
