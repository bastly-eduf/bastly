import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import ParentRelationship from '../models/ParentRelationship.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import {
  AUTH_COOKIE,
  authCookieOptions,
  clearAuthCookieOptions,
  signAuthToken,
} from '../utils/auth.js';
import { HttpError } from '../utils/httpError.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';
import { createStudentCode } from '../utils/studentCode.js';
import { writeAuditLog } from '../services/audit.service.js';
import { notifyRole } from '../services/notification.service.js';
import {
  createParentInvitation,
  createStudentVerification,
} from '../services/invitation.service.js';

const BCRYPT_ROUNDS = 12;
// Keep unknown-email login attempts on the same expensive bcrypt path as known users.
// The value is not a credential; it is only timing padding generated once at startup.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  'bastly-login-timing-padding-not-a-user-password',
  BCRYPT_ROUNDS,
);

export async function registerStudent(req, res) {
  const {
    fullName,
    email,
    phone,
    password,
    school,
    academicLevel,
    parentName,
    parentEmail,
    parentPhone,
  } = req.validatedBody;

  const existing = await User.findOne({ email }).lean();

  if (existing) {
    throw new HttpError(409, 'An account already exists with this email.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    fullName,
    email,
    phone,
    passwordHash,
    role: 'student',
    status: 'active',
  });

  try {
    const profile = await StudentProfile.create({
      user: user._id,
      school,
      academicLevel,
      studentCode: createStudentCode(),
    });

    const relationship = await ParentRelationship.create({
      student: user._id,
      invitedName: parentName,
      invitedEmail: parentEmail,
      invitedPhone: parentPhone,
      status: 'pending',
    });

    await writeAuditLog({
      actor: user._id,
      action: 'student.registered',
      targetType: 'User',
      targetId: user._id,
      ip: req.ip,
    });

    notifyRole('admin', {
      category: 'system',
      type: 'student_registered',
      title: 'New student account',
      message: `${user.fullName} created a Bastly student account.`,
      href: '/admin/enrollments',
      metadata: {
        studentId: String(user._id),
      },
      dedupeKey: `student-registered:${user._id}`,
    }).catch((error) => {
      console.error('Admin signup notification failed:', error.message);
    });

    let emailNotice = 'none';

    if (env.requireEmailVerification) {
      try {
        await createStudentVerification(user);
        emailNotice = 'student_verification';
      } catch (error) {
        console.error('Student verification email failed:', error.message);
      }
    } else {
      try {
        await createParentInvitation(relationship);
        emailNotice = 'parent_invitation';
      } catch (error) {
        console.error('Parent invitation email failed:', error.message);
      }
    }

    const hydratedUser = await User.findById(user._id).select('+tokenVersion');

    if (!env.requireEmailVerification) {
      const token = signAuthToken(hydratedUser);
      res.cookie(AUTH_COOKIE, token, authCookieOptions());
    }

    return res.status(201).json({
      message: env.requireEmailVerification
        ? 'Student account created. Verify your email to continue.'
        : 'Student account created.',
      user: sanitizeUser(hydratedUser),
      student: {
        school: profile.school,
        academicLevel: profile.academicLevel,
        studentCode: profile.studentCode,
      },
      parentInvitationPending: true,
      emailVerificationRequired: env.requireEmailVerification,
      emailNotice,
    });
  } catch (error) {
    await Promise.allSettled([
      StudentProfile.deleteOne({ user: user._id }),
      ParentRelationship.deleteMany({ student: user._id }),
      User.deleteOne({ _id: user._id }),
    ]);

    throw error;
  }
}

export async function login(req, res) {
  const { email, password } = req.validatedBody;

  const user = await User.findOne({ email }).select('+passwordHash +tokenVersion');

  const passwordMatches = await bcrypt.compare(
    password,
    user?.passwordHash || DUMMY_PASSWORD_HASH,
  );

  if (!user || !passwordMatches) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  if (user.status !== 'active') {
    throw new HttpError(403, 'This account is currently unavailable.');
  }

  if (env.requireEmailVerification && !user.emailVerifiedAt) {
    throw new HttpError(403, 'Please verify your email before logging in.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAuthToken(user);
  res.cookie(AUTH_COOKIE, token, authCookieOptions());

  await writeAuditLog({
    actor: user._id,
    action: 'auth.login',
    targetType: 'User',
    targetId: user._id,
    ip: req.ip,
  });

  return res.json({
    message: 'Logged in.',
    user: sanitizeUser(user),
  });
}

export async function logout(req, res) {
  const userId = req.user?._id || null;

  res.clearCookie(AUTH_COOKIE, clearAuthCookieOptions());

  if (userId) {
    await writeAuditLog({
      actor: userId,
      action: 'auth.logout',
      targetType: 'User',
      targetId: userId,
      ip: req.ip,
    });
  }

  return res.status(204).send();
}

export async function me(req, res) {
  return res.json({
    user: sanitizeUser(req.user),
  });
}
