import RewardAssignment from '../models/RewardAssignment.js';
import RewardCard from '../models/RewardCard.js';
import SpinCredit from '../models/SpinCredit.js';
import { writeAuditLog } from '../services/audit.service.js';
import { expireRewardRecords } from '../services/reward.service.js';
import { HttpError } from '../utils/httpError.js';

export async function rewardOverview(req, res) {
  await expireRewardRecords();

  const [
    cards,
    activeCards,
    stockRemaining,
    earnedSpins,
    consumedSpins,
    assignedRewards,
    redeemedRewards,
  ] = await Promise.all([
    RewardCard.countDocuments(),
    RewardCard.countDocuments({
      status: 'active',
      quantityRemaining: { $gt: 0 },
    }),
    RewardCard.aggregate([
      {
        $match: {
          status: 'active',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantityRemaining' },
        },
      },
    ]),
    SpinCredit.countDocuments({ status: 'earned' }),
    SpinCredit.countDocuments({ status: 'consumed' }),
    RewardAssignment.countDocuments({ status: 'assigned' }),
    RewardAssignment.countDocuments({ status: 'redeemed' }),
  ]);

  return res.json({
    counts: {
      cards,
      activeCards,
      stockRemaining: stockRemaining[0]?.total || 0,
      earnedSpins,
      consumedSpins,
      assignedRewards,
      redeemedRewards,
    },
  });
}

export async function listRewardCards(req, res) {
  await expireRewardRecords();

  const cards = await RewardCard.find()
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const stats = await RewardAssignment.aggregate([
    {
      $group: {
        _id: '$rewardCard',
        assigned: { $sum: 1 },
        redeemed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'redeemed'] }, 1, 0],
          },
        },
      },
    },
  ]);

  const statsMap = new Map(
    stats.map((item) => [String(item._id), item]),
  );

  return res.json({
    rewardCards: cards.map((card) => ({
      ...card,
      stats: statsMap.get(String(card._id)) || {
        assigned: 0,
        redeemed: 0,
      },
    })),
  });
}

export async function createRewardCard(req, res) {
  const data = req.validatedBody;

  if (
    data.expiresAt &&
    new Date(data.expiresAt).getTime() <= Date.now()
  ) {
    throw new HttpError(400, 'Reward expiry must be in the future.');
  }

  const rewardCard = await RewardCard.create({
    partnerName: data.partnerName,
    partnerLogoUrl: data.partnerLogoUrl,
    title: data.title,
    offer: data.offer,
    description: data.description,
    instructions: data.instructions,
    redemptionCode: data.redemptionCode,
    expiresAt: data.expiresAt || null,
    quantityTotal: data.quantity,
    quantityRemaining: data.quantity,
    status: data.status,
  });

  await writeAuditLog({
    actor: req.user._id,
    action: 'reward.card.created',
    targetType: 'RewardCard',
    targetId: rewardCard._id,
    metadata: {
      partnerName: rewardCard.partnerName,
      quantity: rewardCard.quantityTotal,
    },
    ip: req.ip,
  });

  return res.status(201).json({ rewardCard });
}

export async function updateRewardCard(req, res) {
  const rewardCard = await RewardCard.findById(req.params.rewardCardId);

  if (!rewardCard) {
    throw new HttpError(404, 'Reward card not found.');
  }

  const data = req.validatedBody;

  if (
    data.expiresAt &&
    new Date(data.expiresAt).getTime() <= Date.now()
  ) {
    throw new HttpError(400, 'Reward expiry must be in the future.');
  }

  const editable = [
    'partnerName',
    'partnerLogoUrl',
    'title',
    'offer',
    'description',
    'instructions',
    'redemptionCode',
    'expiresAt',
    'status',
    'sortOrder',
  ];

  for (const field of editable) {
    if (data[field] !== undefined) {
      rewardCard[field] = data[field];
    }
  }

  if (
    rewardCard.status === 'expired' &&
    (!rewardCard.expiresAt ||
      rewardCard.expiresAt.getTime() > Date.now()) &&
    data.status === 'active'
  ) {
    rewardCard.status = 'active';
  }

  await rewardCard.save();

  await writeAuditLog({
    actor: req.user._id,
    action: 'reward.card.updated',
    targetType: 'RewardCard',
    targetId: rewardCard._id,
    metadata: {
      status: rewardCard.status,
    },
    ip: req.ip,
  });

  return res.json({ rewardCard });
}

export async function restockRewardCard(req, res) {
  const quantity = req.validatedBody.quantity;

  const rewardCard = await RewardCard.findByIdAndUpdate(
    req.params.rewardCardId,
    {
      $inc: {
        quantityTotal: quantity,
        quantityRemaining: quantity,
      },
    },
    {
      new: true,
    },
  );

  if (!rewardCard) {
    throw new HttpError(404, 'Reward card not found.');
  }

  await writeAuditLog({
    actor: req.user._id,
    action: 'reward.card.restocked',
    targetType: 'RewardCard',
    targetId: rewardCard._id,
    metadata: {
      addedQuantity: quantity,
      quantityRemaining: rewardCard.quantityRemaining,
    },
    ip: req.ip,
  });

  return res.json({ rewardCard });
}

export async function listRewardAssignments(req, res) {
  await expireRewardRecords();

  const assignments = await RewardAssignment.find()
    .populate('student', 'fullName email phone')
    .populate('spinCredit', 'weekStart weekEnd status')
    .populate('rewardCard', 'partnerName title offer')
    .sort({ assignedAt: -1 })
    .limit(250)
    .lean();

  return res.json({ assignments });
}
