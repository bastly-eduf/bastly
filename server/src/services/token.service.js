import crypto from 'crypto';

import AuthToken from '../models/AuthToken.js';
import { HttpError } from '../utils/httpError.js';

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function validTokenQuery(rawToken, type, now = new Date()) {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new HttpError(400, 'Invalid or missing token.');
  }

  return {
    tokenHash: hashToken(rawToken),
    type,
    usedAt: null,
    expiresAt: { $gt: now },
  };
}

function invalidTokenError() {
  return new HttpError(
    400,
    'This link is invalid, expired, or has already been used.',
  );
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
  const record = await AuthToken.findOne(
    validTokenQuery(rawToken, type),
  );

  if (!record) {
    throw invalidTokenError();
  }

  return record;
}

// State-changing token flows claim the token atomically before mutating account data.
// Only one concurrent request can move a still-valid token from unused to used.
export async function consumeValidOneTimeToken(rawToken, type) {
  const now = new Date();
  const record = await AuthToken.findOneAndUpdate(
    validTokenQuery(rawToken, type, now),
    { $set: { usedAt: now } },
    { new: true },
  );

  if (!record) {
    throw invalidTokenError();
  }

  return record;
}
