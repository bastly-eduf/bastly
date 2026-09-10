import { Router } from 'express';

import {
  redeem,
  rewardsDashboard,
  spin,
} from '../controllers/studentReward.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import {
  rewardActionLimiter,
  spinLimiter,
} from '../middleware/rateLimiters.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/', asyncHandler(rewardsDashboard));
router.post('/spin', spinLimiter, asyncHandler(spin));
router.post(
  '/assignments/:assignmentId/redeem',
  rewardActionLimiter,
  asyncHandler(redeem),
);

export default router;
