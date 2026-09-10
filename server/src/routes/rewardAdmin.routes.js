import { Router } from 'express';

import {
  createRewardCard,
  listRewardAssignments,
  listRewardCards,
  restockRewardCard,
  rewardOverview,
  updateRewardCard,
} from '../controllers/rewardAdmin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createRewardCardSchema,
  restockRewardCardSchema,
  updateRewardCardSchema,
} from '../validators/reward.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/overview', asyncHandler(rewardOverview));
router.get('/cards', asyncHandler(listRewardCards));
router.post(
  '/cards',
  validate(createRewardCardSchema),
  asyncHandler(createRewardCard),
);
router.patch(
  '/cards/:rewardCardId',
  validate(updateRewardCardSchema),
  asyncHandler(updateRewardCard),
);
router.post(
  '/cards/:rewardCardId/restock',
  validate(restockRewardCardSchema),
  asyncHandler(restockRewardCard),
);
router.get('/assignments', asyncHandler(listRewardAssignments));

export default router;
