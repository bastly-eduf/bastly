import crypto from 'crypto';

import AuthToken from '../models/AuthToken.js';
import { HttpError } from '../utils/httpError.js';

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export async function createOneTimeToken({
  user = null,
  type,
  targetEmail = '',
  metadata = {},
  ttlMinutes,
}) {
  const normalizedEmail = targetEmail.trim().toLowerCase();

  await AuthToken.deleteMany({
    type,
    targetEmail: normalizedEmail,
    usedAt: null,
  });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);

  const record = await AuthToken.create({
    user,
    type,
    tokenHash,
    targetEmail: normalizedEmail,
    metadata,
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
  });

  return { rawToken, record };
}

export async function findValidOneTimeToken(rawToken, type) {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new HttpError(400, 'Invalid or missing token.');
  }

  const tokenHash = hashToken(rawToken);

  const record = await AuthToken.findOne({
    tokenHash,
    type,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new HttpError(400, 'This link is invalid, expired, or has already been used.');
  }

  return record;
}

export async function consumeOneTimeToken(record) {
  record.usedAt = new Date();
  await record.save();
}
