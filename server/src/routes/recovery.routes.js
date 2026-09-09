import { Router } from 'express';

import {
  forgotPassword,
  resendVerification,
  resetPassword,
  verifyEmail,
} from '../controllers/accountRecovery.controller.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  tokenSchema,
} from '../validators/invitation.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/verify-email',
  authLimiter,
  validate(tokenSchema),
  asyncHandler(verifyEmail),
);

router.post(
  '/resend-verification',
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(resendVerification),
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);

router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
);

export default router;
