import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import { env } from '../config/env.js';
import {
  AUTH_COOKIE,
  authCookieOptions,
  signAuthToken,
} from '../utils/auth.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';
import {
  consumeOneTimeToken,
  createOneTimeToken,
  findValidOneTimeToken,
} from '../services/token.service.js';
import {
  sendPasswordResetEmail,
} from '../services/email.service.js';
import {
  createStudentVerification,
  ensureParentInvitationForStudent,
} from '../services/invitation.service.js';
import { writeAuditLog } from '../services/audit.service.js';

const BCRYPT_ROUNDS = 12;

export async function verifyEmail(req, res) {
  const record = await findValidOneTimeToken(
    req.validatedBody.token,
    'email_verification',
  );

  const user = await User.findById(record.user).select('+tokenVersion');

  if (!user || user.status !== 'active') {
    return res.status(400).json({ error: 'This account is not available.' });
  }

  if (!user.emailVerifiedAt) {
    user.emailVerifiedAt = new Date();
    await user.save();
  }

  await consumeOneTimeToken(record);

  if (user.role === 'student') {
    try {
      await ensureParentInvitationForStudent(user._id);
    } catch (error) {
      console.error('Parent invitation after verification failed:', error.message);
    }
  }

  const session = signAuthToken(user);
  res.cookie(AUTH_COOKIE, session, authCookieOptions());

  await writeAuditLog({
    actor: user._id,
    action: 'auth.email.verified',
    targetType: 'User',
    targetId: user._id,
    ip: req.ip,
  });

  return res.json({
    message: 'Email verified.',
    user: sanitizeUser(user),
  });
}

export async function resendVerification(req, res) {
  const { email } = req.validatedBody;

  const user = await User.findOne({ email });

  if (user && user.status === 'active' && !user.emailVerifiedAt) {
    try {
      await createStudentVerification(user);
    } catch (error) {
      console.error('Verification email failed:', error.message);
    }
  }

  return res.json({
    message: 'If that account needs verification, a new email has been sent.',
  });
}

export async function forgotPassword(req, res) {
  const { email } = req.validatedBody;

  const user = await User.findOne({ email });

  if (user && user.status === 'active') {
    try {
      const { rawToken } = await createOneTimeToken({
        user: user._id,
        type: 'password_reset',
        targetEmail: user.email,
        metadata: {
          fullName: user.fullName,
        },
        ttlMinutes: 30,
      });

      const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName,
        resetUrl,
      });
    } catch (error) {
      console.error('Password reset email failed:', error.message);
    }
  }

  return res.json({
    message: 'If an active account exists with that email, reset instructions have been sent.',
  });
}

export async function resetPassword(req, res) {
  const { token: rawToken, password } = req.validatedBody;

  const record = await findValidOneTimeToken(rawToken, 'password_reset');
  const user = await User.findById(record.user).select('+tokenVersion');

  if (!user || user.status !== 'active') {
    return res.status(400).json({ error: 'This account is not available.' });
  }

  user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  user.passwordChangedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  await consumeOneTimeToken(record);

  await writeAuditLog({
    actor: user._id,
    action: 'auth.password.reset',
    targetType: 'User',
    targetId: user._id,
    ip: req.ip,
  });

  return res.json({
    message: 'Password updated. You can log in with your new password.',
  });
}
