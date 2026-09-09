import AuditLog from '../models/AuditLog.js';

export async function writeAuditLog({
  actor = null,
  action,
  targetType = '',
  targetId = null,
  metadata = {},
  ip = '',
}) {
  try {
    await AuditLog.create({
      actor,
      action,
      targetType,
      targetId,
      metadata,
      ip,
    });
  } catch (error) {
    // Audit logging must not break the primary user action.
    console.error('Audit log failed:', error.message);
  }
}
