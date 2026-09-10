import { Router } from 'express';

import {
  redeem,
  rewardsDashboard,
  spin,
} from '../controllers/studentReward.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/', asyncHandler(rewardsDashboard));
router.post('/spin', asyncHandler(spin));
router.post(
  '/assignments/:assignmentId/redeem',
  asyncHandler(redeem),
);

export default router;
