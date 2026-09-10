import { Router } from 'express';

import {
  forgotPassword,
  resendVerification,
  resetPassword,
  verifyEmail,
} from '../controllers/accountRecovery.controller.js';
import { recoveryLimiter } from '../middleware/rateLimiters.js';
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
  recoveryLimiter,
  validate(tokenSchema),
  asyncHandler(verifyEmail),
);

router.post(
  '/resend-verification',
  recoveryLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(resendVerification),
);

router.post(
  '/forgot-password',
  recoveryLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);

router.post(
  '/reset-password',
  recoveryLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
);

export default router;
