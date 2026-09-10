import { Router } from 'express';

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount,
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(listNotifications));
router.get('/unread-count', asyncHandler(unreadNotificationCount));
router.patch(
  '/read-all',
  asyncHandler(markAllNotificationsRead),
);
router.patch(
  '/:notificationId/read',
  asyncHandler(markNotificationRead),
);

export default router;
