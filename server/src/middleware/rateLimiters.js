import { rateLimit } from 'express-rate-limit';

const common = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
};

function message(error) {
  return { error };
}

export const apiLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: message('Too many requests. Please try again shortly.'),
});

export const loginLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: message(
    'Too many login attempts. Please wait and try again.',
  ),
});

export const registrationLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: message(
    'Too many registration attempts. Please wait before trying again.',
  ),
});

export const recoveryLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 6,
  message: message(
    'Too many account recovery requests. Please wait and try again.',
  ),
});

export const invitationLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: message(
    'Too many invitation requests. Please wait and try again.',
  ),
});

export const sensitiveAccountLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  message: message(
    'Too many sensitive account requests. Please wait and try again.',
  ),
});

export const mediaUploadLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: message(
    'Too many media upload requests. Please wait and try again.',
  ),
});

export const assessmentSubmissionLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 20,
  message: message(
    'Too many assessment submissions. Please wait a moment and try again.',
  ),
});

export const spinLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 10,
  message: message(
    'Too many spin requests. Please wait a moment and try again.',
  ),
});

export const rewardActionLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 12,
  message: message(
    'Too many reward actions. Please wait a moment and try again.',
  ),
});
