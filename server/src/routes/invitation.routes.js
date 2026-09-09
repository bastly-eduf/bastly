import { Router } from 'express';

import {
  acceptDoctorInvitation,
  acceptParentInvitation,
  validateInvitation,
} from '../controllers/invitation.controller.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { acceptInviteSchema } from '../validators/invitation.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/validate', authLimiter, asyncHandler(validateInvitation));

router.post(
  '/doctor/accept',
  authLimiter,
  validate(acceptInviteSchema),
  asyncHandler(acceptDoctorInvitation),
);

router.post(
  '/parent/accept',
  authLimiter,
  validate(acceptInviteSchema),
  asyncHandler(acceptParentInvitation),
);

export default router;
