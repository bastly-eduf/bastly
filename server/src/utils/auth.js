import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'bastly_session';

const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      tv: user.tokenVersion || 0,
    },
    env.jwtSecret,
    {
      expiresIn: '7d',
      issuer: 'bastly-api',
      audience: 'bastly-web',
    },
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: 'bastly-api',
    audience: 'bastly-web',
  });
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  };
}

export function clearAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  };
}
