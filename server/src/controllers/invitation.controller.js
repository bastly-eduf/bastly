import bcrypt from 'bcryptjs';

import ParentRelationship from '../models/ParentRelationship.js';
import User from '../models/User.js';
import {
  AUTH_COOKIE,
  authCookieOptions,
  signAuthToken,
} from '../utils/auth.js';
import { HttpError } from '../utils/httpError.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';
import {
  consumeOneTimeToken,
  findValidOneTimeToken,
} from '../services/token.service.js';
import { writeAuditLog } from '../services/audit.service.js';

const BCRYPT_ROUNDS = 12;

function inviteTypeFromRequest(req) {
  const type = String(req.query.type || req.body.type || '');

  if (!['doctor_invite', 'parent_invite'].includes(type)) {
    throw new HttpError(400, 'Invalid invitation type.');
  }

  return type;
}

export async function validateInvitation(req, res) {
  const type = inviteTypeFromRequest(req);
  const token = await findValidOneTimeToken(req.query.token, type);

  const existing = await User.findOne({ email: token.targetEmail }).lean();

  return res.json({
    invitation: {
      type,
      email: token.targetEmail,
      fullName:
        token.metadata?.fullName ||
        token.metadata?.parentName ||
        existing?.fullName ||
        '',
      studentName: token.metadata?.studentName || '',
      existingAccount: Boolean(existing),
      existingRole: existing?.role || null,
      expiresAt: token.expiresAt,
    },
  });
}

export async function acceptDoctorInvitation(req, res) {
  const { token: rawToken, password } = req.validatedBody;

  if (!password) {
    throw new HttpError(400, 'Choose a password to activate the doctor account.');
  }

  const token = await findValidOneTimeToken(rawToken, 'doctor_invite');

  const existing = await User.findOne({ email: token.targetEmail });

  if (existing) {
    throw new HttpError(409, 'An account already exists with this email.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    fullName: token.metadata?.fullName || token.targetEmail,
    email: token.targetEmail,
    phone: token.metadata?.phone || '',
    passwordHash,
    role: 'doctor',
    status: 'active',
    emailVerifiedAt: new Date(),
  });

  await consumeOneTimeToken(token);

  const hydratedUser = await User.findById(user._id).select('+tokenVersion');
  const session = signAuthToken(hydratedUser);

  res.cookie(AUTH_COOKIE, session, authCookieOptions());

  await writeAuditLog({
    actor: user._id,
    action: 'doctor.invitation.accepted',
    targetType: 'User',
    targetId: user._id,
    ip: req.ip,
  });

  return res.status(201).json({
    message: 'Doctor account activated.',
    user: sanitizeUser(hydratedUser),
  });
}

export async function acceptParentInvitation(req, res) {
  const { token: rawToken, password } = req.validatedBody;

  const token = await findValidOneTimeToken(rawToken, 'parent_invite');

  const relationship = await ParentRelationship.findById(
    token.metadata?.relationshipId,
  );

  if (
    !relationship ||
    relationship.status !== 'pending' ||
    relationship.invitedEmail !== token.targetEmail
  ) {
    throw new HttpError(400, 'This parent invitation is no longer available.');
  }

  let user = await User.findOne({ email: token.targetEmail }).select('+tokenVersion');

  if (user && user.role !== 'parent') {
    throw new HttpError(
      409,
      'This email belongs to a different Bastly account role. Contact Bastly support.',
    );
  }

  if (user) {
    if (user.status !== 'active') {
      throw new HttpError(403, 'This parent account is currently unavailable.');
    }

    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    relationship.parent = user._id;
    relationship.status = 'active';
    relationship.linkedAt = new Date();
    await relationship.save();

    await consumeOneTimeToken(token);

    await writeAuditLog({
      actor: user._id,
      action: 'parent.child.linked',
      targetType: 'User',
      targetId: relationship.student,
      ip: req.ip,
    });

    return res.json({
      message: 'Student linked to your existing parent account. Log in to continue.',
      existingAccount: true,
      email: user.email,
    });
  }

  if (!password) {
    throw new HttpError(400, 'Choose a password to create the parent account.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  user = await User.create({
    fullName: token.metadata?.parentName || relationship.invitedName,
    email: token.targetEmail,
    phone: token.metadata?.parentPhone || relationship.invitedPhone || '',
    passwordHash,
    role: 'parent',
    status: 'active',
    emailVerifiedAt: new Date(),
  });

  relationship.parent = user._id;
  relationship.status = 'active';
  relationship.linkedAt = new Date();
  await relationship.save();

  await consumeOneTimeToken(token);

  const hydratedUser = await User.findById(user._id).select('+tokenVersion');
  const session = signAuthToken(hydratedUser);

  res.cookie(AUTH_COOKIE, session, authCookieOptions());

  await writeAuditLog({
    actor: user._id,
    action: 'parent.invitation.accepted',
    targetType: 'User',
    targetId: relationship.student,
    ip: req.ip,
  });

  return res.status(201).json({
    message: 'Parent account activated.',
    existingAccount: false,
    user: sanitizeUser(hydratedUser),
  });
}
