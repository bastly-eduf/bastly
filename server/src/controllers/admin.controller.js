import User from '../models/User.js';
import { env } from '../config/env.js';
import { createDoctorInvitation } from '../services/invitation.service.js';
import { HttpError } from '../utils/httpError.js';
import { writeAuditLog } from '../services/audit.service.js';

export async function inviteDoctor(req, res) {
  const { fullName, email, phone } = req.validatedBody;

  const existing = await User.findOne({ email }).lean();

  if (existing) {
    throw new HttpError(409, 'An account already exists with this email.');
  }

  const invitation = await createDoctorInvitation({
    fullName,
    email,
    phone,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'doctor.invitation.created',
    targetType: 'Email',
    metadata: { email, fullName },
    ip: req.ip,
  });

  return res.status(201).json({
    message: 'Doctor invitation created.',
    ...(env.nodeEnv !== 'production' && {
      developmentInviteUrl: invitation.inviteUrl,
    }),
  });
}
