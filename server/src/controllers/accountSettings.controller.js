import bcrypt from 'bcryptjs';

import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import {
  AUTH_COOKIE,
  authCookieOptions,
  signAuthToken,
} from '../utils/auth.js';
import { HttpError } from '../utils/httpError.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';
import { writeAuditLog } from '../services/audit.service.js';
import { createNotification } from '../services/notification.service.js';

const BCRYPT_ROUNDS = 12;

function accountSecurity(user) {
  return {
    emailVerified: Boolean(user.emailVerifiedAt),
    lastLoginAt: user.lastLoginAt || null,
    passwordChangedAt: user.passwordChangedAt || null,
    createdAt: user.createdAt || null,
  };
}

export async function getAccountSettings(req, res) {
  const studentProfile =
    req.user.role === 'student'
      ? await StudentProfile.findOne({
          user: req.user._id,
        }).lean()
      : null;

  return res.json({
    user: sanitizeUser(req.user),
    security: accountSecurity(req.user),
    studentProfile: studentProfile
      ? {
          school: studentProfile.school,
          academicLevel: studentProfile.academicLevel,
          studentCode: studentProfile.studentCode,
        }
      : null,
  });
}

export async function updateAccountProfile(req, res) {
  const {
    fullName,
    phone,
    school,
    academicLevel,
  } = req.validatedBody;

  req.user.fullName = fullName;
  req.user.phone = phone;
  await req.user.save();

  let studentProfile = null;

  if (req.user.role === 'student') {
    const update = {};

    if (school !== undefined) {
      update.school = school;
    }

    if (academicLevel !== undefined) {
      update.academicLevel = academicLevel;
    }

    studentProfile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

  await writeAuditLog({
    actor: req.user._id,
    action: 'account.profile.updated',
    targetType: 'User',
    targetId: req.user._id,
    metadata: {
      role: req.user.role,
    },
    ip: req.ip,
  });

  return res.json({
    message: 'Account details updated.',
    user: sanitizeUser(req.user),
    studentProfile: studentProfile
      ? {
          school: studentProfile.school,
          academicLevel: studentProfile.academicLevel,
          studentCode: studentProfile.studentCode,
        }
      : null,
  });
}

export async function changePassword(req, res) {
  const {
    currentPassword,
    newPassword,
  } = req.validatedBody;

  const user = await User.findById(req.user._id).select(
    '+passwordHash +tokenVersion',
  );

  if (!user || user.status !== 'active') {
    throw new HttpError(
      401,
      'This account is not available.',
    );
  }

  const currentMatches = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!currentMatches) {
    throw new HttpError(
      400,
      'Current password is incorrect.',
    );
  }

  const isSamePassword = await bcrypt.compare(
    newPassword,
    user.passwordHash,
  );

  if (isSamePassword) {
    throw new HttpError(
      400,
      'Choose a new password that is different from your current password.',
    );
  }

  user.passwordHash = await bcrypt.hash(
    newPassword,
    BCRYPT_ROUNDS,
  );
  user.passwordChangedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  await user.save();

  const token = signAuthToken(user);
  res.cookie(
    AUTH_COOKIE,
    token,
    authCookieOptions(),
  );

  await Promise.allSettled([
    writeAuditLog({
      actor: user._id,
      action: 'account.password.changed',
      targetType: 'User',
      targetId: user._id,
      metadata: {
        invalidatedPreviousSessions: true,
      },
      ip: req.ip,
    }),
    createNotification({
      recipient: user._id,
      category: 'system',
      type: 'password_changed',
      title: 'Password changed',
      message:
        'Your Bastly password was changed. Other existing sessions were signed out for security.',
      href: `/${user.role}/settings`,
      dedupeKey: `password-changed:${user.passwordChangedAt.toISOString()}`,
    }),
  ]);

  return res.json({
    message:
      'Password changed. Other existing sessions have been signed out.',
    user: sanitizeUser(user),
    security: accountSecurity(user),
  });
}

export async function invalidateOtherSessions(req, res) {
  const user = await User.findById(req.user._id).select(
    '+tokenVersion',
  );

  if (!user || user.status !== 'active') {
    throw new HttpError(
      401,
      'This account is not available.',
    );
  }

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  const token = signAuthToken(user);
  res.cookie(
    AUTH_COOKIE,
    token,
    authCookieOptions(),
  );

  await writeAuditLog({
    actor: user._id,
    action: 'account.sessions.invalidated',
    targetType: 'User',
    targetId: user._id,
    metadata: {
      currentSessionPreserved: true,
    },
    ip: req.ip,
  });

  return res.json({
    message:
      'Other Bastly sessions have been signed out. This device stays logged in.',
    user: sanitizeUser(user),
  });
}
