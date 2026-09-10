import Notification from '../models/Notification.js';
import { HttpError } from '../utils/httpError.js';

export async function listNotifications(req, res) {
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.min(parsedLimit, 50))
    : 20;

  const query = {
    recipient: req.user._id,
  };

  if (req.query.unread === 'true') {
    query.readAt = null;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    readAt: null,
  });

  return res.json({
    notifications,
    unreadCount,
  });
}

export async function unreadNotificationCount(req, res) {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    readAt: null,
  });

  return res.json({ unreadCount });
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.notificationId,
      recipient: req.user._id,
    },
    {
      $set: {
        readAt: new Date(),
      },
    },
    {
      new: true,
    },
  );

  if (!notification) {
    throw new HttpError(404, 'Notification not found.');
  }

  return res.json({ notification });
}

export async function markAllNotificationsRead(req, res) {
  const now = new Date();

  await Notification.updateMany(
    {
      recipient: req.user._id,
      readAt: null,
    },
    {
      $set: {
        readAt: now,
      },
    },
  );

  return res.json({
    message: 'Notifications marked as read.',
    readAt: now,
  });
}
