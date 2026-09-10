import { Router } from 'express';

import {
  changePassword,
  getAccountSettings,
  invalidateOtherSessions,
  updateAccountProfile,
} from '../controllers/accountSettings.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import {
  changePasswordSchema,
  updateAccountProfileSchema,
} from '../validators/accountSettings.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get(
  '/settings',
  asyncHandler(getAccountSettings),
);

router.patch(
  '/settings/profile',
  validate(updateAccountProfileSchema),
  asyncHandler(updateAccountProfile),
);

router.post(
  '/settings/change-password',
  authLimiter,
  validate(changePasswordSchema),
  asyncHandler(changePassword),
);

router.post(
  '/settings/invalidate-sessions',
  authLimiter,
  asyncHandler(invalidateOtherSessions),
);

export default router;
