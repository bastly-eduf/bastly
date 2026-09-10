import { Router } from 'express';

import {
  acceptDoctorInvitation,
  acceptParentInvitation,
  validateInvitation,
} from '../controllers/invitation.controller.js';
import { invitationLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { acceptInviteSchema } from '../validators/invitation.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/validate', invitationLimiter, asyncHandler(validateInvitation));

router.post(
  '/doctor/accept',
  invitationLimiter,
  validate(acceptInviteSchema),
  asyncHandler(acceptDoctorInvitation),
);

router.post(
  '/parent/accept',
  invitationLimiter,
  validate(acceptInviteSchema),
  asyncHandler(acceptParentInvitation),
);

export default router;
