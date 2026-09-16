import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import DoctorProfile from '../models/DoctorProfile.js';
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
  consumeValidOneTimeToken,
  findValidOneTimeToken,
} from '../services/token.service.js';
import { writeAuditLog } from '../services/audit.service.js';
import { createStudentVerification } from '../services/invitation.service.js';

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
  const selfService =
    type === 'parent_invite' && token.metadata?.selfService === true;

  const existing = token.targetEmail
    ? await User.findOne({ email: token.targetEmail }).lean()
    : null;

  return res.json({
    invitation: {
      type,
      email: token.targetEmail || '',
      fullName:
        token.metadata?.fullName ||
        token.metadata?.parentName ||
        existing?.fullName ||
        '',
      phone: token.metadata?.parentPhone || existing?.phone || '',
      studentName: token.metadata?.studentName || '',
      selfService,
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

  const doctorProfileId = token.metadata?.doctorProfileId || null;

  if (doctorProfileId) {
    const profile = await DoctorProfile.findById(doctorProfileId);

    if (!profile) {
      throw new HttpError(400, 'The linked doctor profile no longer exists.');
    }

    if (profile.user) {
      throw new HttpError(409, 'That doctor profile is already linked to an account.');
    }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await consumeValidOneTimeToken(rawToken, 'doctor_invite');

  const user = await User.create({
    fullName: token.metadata?.fullName || token.targetEmail,
    email: token.targetEmail,
    phone: token.metadata?.phone || '',
    passwordHash,
    role: 'doctor',
    status: 'active',
    emailVerifiedAt: new Date(),
  });

  if (doctorProfileId) {
    await DoctorProfile.findByIdAndUpdate(doctorProfileId, {
      user: user._id,
    });
  }

  const hydratedUser = await User.findById(user._id).select('+tokenVersion');
  const session = signAuthToken(hydratedUser);

  res.cookie(AUTH_COOKIE, session, authCookieOptions());

  await writeAuditLog({
    actor: user._id,
    action: 'doctor.invitation.accepted',
    targetType: 'User',
    targetId: user._id,
    metadata: { doctorProfileId },
    ip: req.ip,
  });

  return res.status(201).json({
    message: 'Doctor account activated.',
    user: sanitizeUser(hydratedUser),
  });
}

async function activeParentRelationship(studentId, parentId) {
  return ParentRelationship.findOne({
    student: studentId,
    parent: parentId,
    status: 'active',
  }).lean();
}

async function linkParent({
  relationship,
  studentId,
  parent,
  invitedName,
  invitedEmail,
  invitedPhone,
}) {
  if (relationship) {
    relationship.parent = parent._id;
    relationship.invitedName = invitedName;
    relationship.invitedEmail = invitedEmail;
    relationship.invitedPhone = invitedPhone;
    relationship.status = 'active';
    relationship.linkedAt = new Date();
    await relationship.save();
    return relationship;
  }

  return ParentRelationship.findOneAndUpdate(
    {
      student: studentId,
      invitedEmail,
    },
    {
      $set: {
        parent: parent._id,
        invitedName,
        invitedPhone,
        status: 'active',
        linkedAt: new Date(),
      },
      $setOnInsert: {
        student: studentId,
        invitedEmail,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
}

export async function acceptParentInvitation(req, res) {
  const {
    token: rawToken,
    fullName,
    email,
    phone,
    password,
  } = req.validatedBody;

  const token = await findValidOneTimeToken(rawToken, 'parent_invite');
  const selfService = token.metadata?.selfService === true;

  let relationship = null;
  let studentId =
    token.metadata?.studentId ||
    token.user ||
    null;

  if (token.metadata?.relationshipId) {
    relationship = await ParentRelationship.findById(
      token.metadata.relationshipId,
    );

    if (!relationship || relationship.status !== 'pending') {
      throw new HttpError(400, 'This parent invitation is no longer available.');
    }

    studentId = relationship.student;
  }

  if (!studentId) {
    throw new HttpError(400, 'This parent invitation is missing its student link.');
  }

  const student = await User.findById(studentId).lean();

  if (!student || student.role !== 'student' || student.status !== 'active') {
    throw new HttpError(400, 'The linked student account is not available.');
  }

  if (token.targetEmail && token.targetEmail !== email) {
    throw new HttpError(
      400,
      'Use the email address this parent invitation was sent to.',
    );
  }

  if (student.email === email) {
    throw new HttpError(
      400,
      'The parent email must be different from the student email.',
    );
  }

  let user = await User.findOne({ email }).select(
    '+passwordHash +tokenVersion',
  );
  let existingAccount = Boolean(user);
  let passwordHash = null;

  if (user) {
    if (user.role !== 'parent') {
      throw new HttpError(
        409,
        'This email belongs to a different Bastly account role. Use a Parent account or contact Bastly support.',
      );
    }

    if (user.status !== 'active') {
      throw new HttpError(403, 'This parent account is currently unavailable.');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new HttpError(
        401,
        'That password does not match the existing Bastly Parent account.',
      );
    }

    if (await activeParentRelationship(studentId, user._id)) {
      throw new HttpError(
        409,
        'This parent account is already linked to the student.',
      );
    }
  } else {
    passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  await consumeValidOneTimeToken(rawToken, 'parent_invite');

  if (!user) {
    user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: 'parent',
      status: 'active',
      emailVerifiedAt: env.requireEmailVerification ? null : new Date(),
    });

    user = await User.findById(user._id).select('+tokenVersion');
  }

  const relationshipName = existingAccount ? user.fullName : fullName;
  const relationshipPhone = existingAccount ? user.phone || '' : phone;

  await linkParent({
    relationship,
    studentId,
    parent: user,
    invitedName: relationshipName,
    invitedEmail: email,
    invitedPhone: relationshipPhone,
  });

  await writeAuditLog({
    actor: user._id,
    action: existingAccount
      ? 'parent.child.linked'
      : 'parent.invitation.accepted',
    targetType: 'User',
    targetId: studentId,
    metadata: { selfService },
    ip: req.ip,
  });

  if (env.requireEmailVerification && !user.emailVerifiedAt) {
    try {
      await createStudentVerification(user);
    } catch (error) {
      console.error('Parent verification email failed:', error.message);
    }

    return res.status(existingAccount ? 200 : 201).json({
      message: 'Parent account linked. Verify your email to continue.',
      existingAccount,
      emailVerificationRequired: true,
      email: user.email,
    });
  }

  const session = signAuthToken(user);
  res.cookie(AUTH_COOKIE, session, authCookieOptions());

  return res.status(existingAccount ? 200 : 201).json({
    message: existingAccount
      ? 'Student linked to your Bastly Parent account.'
      : 'Parent account activated and linked.',
    existingAccount,
    emailVerificationRequired: false,
    user: sanitizeUser(user),
  });
}
