import { Router } from 'express';

import {
  commitUpload,
  createUpload,
  getMediaConfig,
  removeMedia,
} from '../controllers/mediaAdmin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { mediaUploadLimiter } from '../middleware/rateLimiters.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  commitMediaUploadSchema,
  createMediaUploadSchema,
} from '../validators/media.validators.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/config', asyncHandler(getMediaConfig));
router.post(
  '/uploads',
  mediaUploadLimiter,
  validate(createMediaUploadSchema),
  asyncHandler(createUpload),
);
router.post(
  '/uploads/commit',
  mediaUploadLimiter,
  validate(commitMediaUploadSchema),
  asyncHandler(commitUpload),
);
router.delete(
  '/:entityType/:entityId/:slot',
  mediaUploadLimiter,
  asyncHandler(removeMedia),
);

export default router;
