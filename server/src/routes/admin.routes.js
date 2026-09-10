import { Router } from 'express';

import { inviteDoctor } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { invitationLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { createDoctorInviteSchema } from '../validators/invitation.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.post(
  '/invitations/doctor',
  invitationLimiter,
  validate(createDoctorInviteSchema),
  asyncHandler(inviteDoctor),
);

export default router;
