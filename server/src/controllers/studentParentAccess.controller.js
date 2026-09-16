import AuthToken from '../models/AuthToken.js';
import ParentRelationship from '../models/ParentRelationship.js';
import { env } from '../config/env.js';
import { writeAuditLog } from '../services/audit.service.js';
import { createOneTimeToken } from '../services/token.service.js';

const PARENT_INVITE_TTL_MINUTES = 60 * 72;

export async function getParentAccess(req, res) {
  const now = new Date();

  const [relationships, pendingInvite] = await Promise.all([
    ParentRelationship.find({
      student: req.user._id,
      status: 'active',
      parent: { $ne: null },
    })
      .populate('parent', 'fullName email phone status')
      .sort({ linkedAt: 1, createdAt: 1 })
      .lean(),
    AuthToken.findOne({
      user: req.user._id,
      type: 'parent_invite',
      usedAt: null,
      expiresAt: { $gt: now },
      'metadata.selfService': true,
    })
      .sort({ createdAt: -1 })
      .select('expiresAt createdAt')
      .lean(),
  ]);

  return res.json({
    linkedParents: relationships
      .filter((relationship) => relationship.parent?.status === 'active')
      .map((relationship) => ({
        relationshipId: relationship._id,
        fullName: relationship.parent.fullName,
        email: relationship.parent.email,
        phone: relationship.parent.phone || '',
        linkedAt: relationship.linkedAt,
      })),
    pendingInvite: pendingInvite
      ? {
          exists: true,
          createdAt: pendingInvite.createdAt,
          expiresAt: pendingInvite.expiresAt,
        }
      : null,
  });
}

export async function createParentShareInvitation(req, res) {
  const { rawToken, record } = await createOneTimeToken({
    user: req.user._id,
    type: 'parent_invite',
    targetEmail: '',
    metadata: {
      selfService: true,
      studentId: String(req.user._id),
      studentName: req.user.fullName,
    },
    ttlMinutes: PARENT_INVITE_TTL_MINUTES,
  });

  const inviteUrl = `${env.clientUrl}/invite/parent?token=${rawToken}`;

  await writeAuditLog({
    actor: req.user._id,
    action: 'parent.invitation.created',
    targetType: 'User',
    targetId: req.user._id,
    metadata: {
      selfService: true,
      expiresAt: record.expiresAt,
    },
    ip: req.ip,
  });

  return res.status(201).json({
    inviteUrl,
    expiresAt: record.expiresAt,
  });
}
