import Notification from '../models/Notification.js';
import ParentRelationship from '../models/ParentRelationship.js';
import User from '../models/User.js';

const RETENTION_DAYS = 180;

function expiresAt() {
  return new Date(
    Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
}

export async function createNotification({
  recipient,
  category = 'system',
  type,
  title,
  message,
  href = '',
  metadata = {},
  dedupeKey,
}) {
  if (!recipient) return null;

  const payload = {
    recipient,
    category,
    type,
    title,
    message,
    href,
    metadata,
    expiresAt: expiresAt(),
    ...(dedupeKey ? { dedupeKey } : {}),
  };

  if (!dedupeKey) {
    return Notification.create(payload);
  }

  try {
    return await Notification.findOneAndUpdate(
      {
        recipient,
        dedupeKey,
      },
      {
        $setOnInsert: payload,
      },
      {
        new: true,
        upsert: true,
      },
    );
  } catch (error) {
    if (error?.code === 11000) {
      return Notification.findOne({ recipient, dedupeKey });
    }

    throw error;
  }
}

export async function notifyUsers(userIds, payload) {
  const uniqueIds = [
    ...new Set(
      (userIds || [])
        .filter(Boolean)
        .map((value) => String(value)),
    ),
  ];

  if (!uniqueIds.length) return [];

  const results = await Promise.allSettled(
    uniqueIds.map((recipient) =>
      createNotification({
        recipient,
        ...payload,
      }),
    ),
  );

  return results;
}

export async function notifyRole(role, payload) {
  const users = await User.find({
    role,
    status: 'active',
  })
    .select('_id')
    .lean();

  return notifyUsers(
    users.map((user) => user._id),
    payload,
  );
}

export async function notifyParentsOfStudent(studentId, payload) {
  const relationships = await ParentRelationship.find({
    student: studentId,
    status: 'active',
    parent: { $ne: null },
  })
    .select('parent')
    .lean();

  return notifyUsers(
    relationships.map((relationship) => relationship.parent),
    payload,
  );
}
