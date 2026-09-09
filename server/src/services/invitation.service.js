import ParentRelationship from '../models/ParentRelationship.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import {
  sendDoctorInviteEmail,
  sendParentInviteEmail,
  sendVerificationEmail,
} from './email.service.js';
import { createOneTimeToken } from './token.service.js';

export async function createDoctorInvitation({
  fullName,
  email,
  phone = '',
  doctorProfileId = null,
}) {
  const { rawToken, record } = await createOneTimeToken({
    type: 'doctor_invite',
    targetEmail: email,
    metadata: {
      fullName,
      phone,
      doctorProfileId,
    },
    ttlMinutes: 60 * 48,
  });

  const inviteUrl = `${env.clientUrl}/invite/doctor?token=${rawToken}`;

  await sendDoctorInviteEmail({
    email,
    fullName,
    inviteUrl,
  });

  return {
    record,
    inviteUrl,
  };
}

export async function createParentInvitation(relationship) {
  if (!relationship || relationship.status !== 'pending') {
    return null;
  }

  const student = await User.findById(relationship.student).lean();

  if (!student) {
    return null;
  }

  const { rawToken, record } = await createOneTimeToken({
    type: 'parent_invite',
    targetEmail: relationship.invitedEmail,
    metadata: {
      relationshipId: String(relationship._id),
      parentName: relationship.invitedName,
      parentPhone: relationship.invitedPhone,
      studentName: student.fullName,
    },
    ttlMinutes: 60 * 72,
  });

  const inviteUrl = `${env.clientUrl}/invite/parent?token=${rawToken}`;

  await sendParentInviteEmail({
    email: relationship.invitedEmail,
    parentName: relationship.invitedName,
    studentName: student.fullName,
    inviteUrl,
  });

  return {
    record,
    inviteUrl,
  };
}

export async function createStudentVerification(user) {
  const { rawToken, record } = await createOneTimeToken({
    user: user._id,
    type: 'email_verification',
    targetEmail: user.email,
    metadata: {
      fullName: user.fullName,
    },
    ttlMinutes: 60 * 24,
  });

  const verificationUrl = `${env.clientUrl}/verify-email?token=${rawToken}`;

  await sendVerificationEmail({
    email: user.email,
    fullName: user.fullName,
    verificationUrl,
  });

  return {
    record,
    verificationUrl,
  };
}

export async function ensureParentInvitationForStudent(studentId) {
  const relationship = await ParentRelationship.findOne({
    student: studentId,
    status: 'pending',
  });

  if (!relationship) {
    return null;
  }

  return createParentInvitation(relationship);
}
