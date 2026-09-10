import { writeAuditLog } from '../services/audit.service.js';
import {
  redeemStudentAssignment,
  spinForStudent,
  studentRewardDashboard,
} from '../services/reward.service.js';

export async function rewardsDashboard(req, res) {
  const dashboard = await studentRewardDashboard(req.user._id);
  return res.json(dashboard);
}

export async function spin(req, res) {
  const { credit, assignment } = await spinForStudent(req.user._id);

  await writeAuditLog({
    actor: req.user._id,
    action: 'reward.spin.consumed',
    targetType: 'RewardAssignment',
    targetId: assignment._id,
    metadata: {
      spinCreditId: String(credit._id),
      weekStart: credit.weekStart,
      rewardCardId: String(assignment.rewardCard),
    },
    ip: req.ip,
  });

  return res.status(201).json({
    message: 'Bastly Spin completed.',
    credit: {
      _id: credit._id,
      weekStart: credit.weekStart,
      weekEnd: credit.weekEnd,
      status: credit.status,
    },
    assignment,
  });
}

export async function redeem(req, res) {
  const assignment = await redeemStudentAssignment(
    req.user._id,
    req.params.assignmentId,
  );

  await writeAuditLog({
    actor: req.user._id,
    action: 'reward.assignment.redeemed',
    targetType: 'RewardAssignment',
    targetId: assignment._id,
    ip: req.ip,
  });

  return res.json({
    message: 'Bastly Card marked as used.',
    assignment,
  });
}
