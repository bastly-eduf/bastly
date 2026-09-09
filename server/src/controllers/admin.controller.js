import DoctorProfile from '../models/DoctorProfile.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { createDoctorInvitation } from '../services/invitation.service.js';
import { HttpError } from '../utils/httpError.js';
import { writeAuditLog } from '../services/audit.service.js';

export async function inviteDoctor(req, res) {
  const { fullName, email, phone, doctorProfileId } = req.validatedBody;

  const existing = await User.findOne({ email }).lean();

  if (existing) {
    throw new HttpError(409, 'An account already exists with this email.');
  }

  if (doctorProfileId) {
    const profile = await DoctorProfile.findById(doctorProfileId).lean();

    if (!profile) {
      throw new HttpError(404, 'Doctor profile not found.');
    }

    if (profile.user) {
      throw new HttpError(409, 'That doctor profile is already linked to an account.');
    }
  }

  const invitation = await createDoctorInvitation({
    fullName,
    email,
    phone,
    doctorProfileId: doctorProfileId || null,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'doctor.invitation.created',
    targetType: 'Email',
    metadata: { email, fullName, doctorProfileId: doctorProfileId || null },
    ip: req.ip,
  });

  return res.status(201).json({
    message: 'Doctor invitation created.',
    ...(env.nodeEnv !== 'production' && {
      developmentInviteUrl: invitation.inviteUrl,
    }),
  });
}
