import {
  commitMediaUpload,
  createMediaUpload,
  mediaConfiguration,
  removeEntityMedia,
} from '../services/media.service.js';
import { writeAuditLog } from '../services/audit.service.js';

export async function getMediaConfig(req, res) {
  return res.json(mediaConfiguration());
}

export async function createUpload(req, res) {
  const result = await createMediaUpload({
    actorId: req.user._id,
    ...req.validatedBody,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'media.upload.started',
    targetType: req.validatedBody.entityType,
    targetId: req.validatedBody.entityId,
    metadata: {
      slot: req.validatedBody.slot,
      uploadId: result.uploadId,
    },
    ip: req.ip,
  });

  return res.status(201).json(result);
}

export async function commitUpload(req, res) {
  const result = await commitMediaUpload({
    actorId: req.user._id,
    uploadId: req.validatedBody.uploadId,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'media.upload.committed',
    targetType: result.entityType,
    targetId: result.entityId,
    metadata: {
      slot: result.slot,
      uploadId: req.validatedBody.uploadId,
    },
    ip: req.ip,
  });

  return res.json(result);
}

export async function removeMedia(req, res) {
  const result = await removeEntityMedia({
    entityType: req.params.entityType,
    entityId: req.params.entityId,
    slot: req.params.slot,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'media.removed',
    targetType: result.entityType,
    targetId: result.entityId,
    metadata: {
      slot: result.slot,
    },
    ip: req.ip,
  });

  return res.json({
    message: 'Media removed.',
    ...result,
  });
}
