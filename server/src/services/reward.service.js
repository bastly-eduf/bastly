import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import Enrollment from '../models/Enrollment.js';
import RewardAssignment from '../models/RewardAssignment.js';
import RewardCard from '../models/RewardCard.js';
import SpinCredit from '../models/SpinCredit.js';
import { HttpError } from '../utils/httpError.js';
import { endOfWeekUtc, startOfWeekUtc } from '../utils/week.js';

const STALE_PROCESSING_MS = 5 * 60 * 1000;

function weekKey(date) {
  return startOfWeekUtc(date).toISOString();
}

function quizWeekStart(quiz) {
  return startOfWeekUtc(quiz.performanceWeekStart || quiz.publishedAt);
}

function enrollmentCoversWeek(enrollment, weekStart, weekEnd) {
  const accessStart = enrollment.accessStartDate
    ? new Date(enrollment.accessStartDate)
    : new Date(enrollment.createdAt);

  const accessEnd = enrollment.accessEndDate
    ? new Date(enrollment.accessEndDate)
    : null;

  return (
    accessStart.getTime() < weekEnd.getTime() &&
    (!accessEnd || accessEnd.getTime() >= weekStart.getTime())
  );
}

async function expireRewards() {
  const now = new Date();

  await Promise.all([
    RewardCard.updateMany(
      {
        status: { $ne: 'expired' },
        expiresAt: { $ne: null, $lt: now },
      },
      { $set: { status: 'expired' } },
    ),
    RewardAssignment.updateMany(
      {
        status: 'assigned',
        expiresAt: { $ne: null, $lt: now },
      },
      { $set: { status: 'expired' } },
    ),
  ]);
}

async function recoverStaleProcessingCredits(studentId) {
  const cutoff = new Date(Date.now() - STALE_PROCESSING_MS);

  const staleCredits = await SpinCredit.find({
    student: studentId,
    status: 'processing',
    processingAt: { $lt: cutoff },
  });

  for (const credit of staleCredits) {
    const assignment = await RewardAssignment.findOne({
      spinCredit: credit._id,
      student: studentId,
    }).select('_id');

    if (assignment) {
      credit.status = 'consumed';
      credit.consumedAt = credit.consumedAt || new Date();
      credit.processingAt = null;
      credit.rewardAssignment = assignment._id;
    } else {
      credit.status = 'earned';
      credit.processingAt = null;
    }

    await credit.save();
  }
}

export async function syncStudentSpinCredits(studentId) {
  await recoverStaleProcessingCredits(studentId);

  const now = new Date();

  const enrollments = await Enrollment.find({
    student: studentId,
    status: 'active',
    paymentStatus: 'paid',
  })
    .select('course accessStartDate accessEndDate createdAt')
    .lean();

  if (!enrollments.length) {
    return [];
  }

  const courseIds = [
    ...new Set(enrollments.map((item) => String(item.course))),
  ];

  const quizzes = await Assessment.find({
    course: { $in: courseIds },
    type: 'quiz',
    status: { $in: ['published', 'archived'] },
    publishedAt: { $ne: null },
  })
    .select('_id course publishedAt performanceWeekStart')
    .lean();

  if (!quizzes.length) {
    return [];
  }

  const quizzesByWeek = new Map();

  for (const quiz of quizzes) {
    const weekStart = quizWeekStart(quiz);
    const weekEnd = endOfWeekUtc(weekStart);

    const covered = enrollments.some(
      (enrollment) =>
        String(enrollment.course) === String(quiz.course) &&
        enrollmentCoversWeek(enrollment, weekStart, weekEnd),
    );

    if (!covered) continue;

    const key = weekKey(weekStart);

    if (!quizzesByWeek.has(key)) {
      quizzesByWeek.set(key, []);
    }

    quizzesByWeek.get(key).push(quiz);
  }

  const eligibleQuizIds = [
    ...new Set(
      [...quizzesByWeek.values()]
        .flat()
        .map((quiz) => String(quiz._id)),
    ),
  ];

  if (!eligibleQuizIds.length) {
    return [];
  }

  const firstAttempts = await AssessmentAttempt.find({
    student: studentId,
    assessment: { $in: eligibleQuizIds },
    attemptNumber: 1,
  })
    .select('assessment percentage')
    .lean();

  const attemptMap = new Map(
    firstAttempts.map((attempt) => [
      String(attempt.assessment),
      Number(attempt.percentage || 0),
    ]),
  );

  const synced = [];

  for (const [key, weekQuizzes] of quizzesByWeek.entries()) {
    const weekStart = new Date(key);
    const weekEnd = endOfWeekUtc(weekStart);
    const allStar = weekQuizzes.every((quiz) => {
      const score = attemptMap.get(String(quiz._id));
      return score !== undefined && score >= 90;
    });

    const courseIdsForWeek = [
      ...new Set(weekQuizzes.map((quiz) => quiz.course)),
    ];

    let existing = await SpinCredit.findOne({
      student: studentId,
      weekStart,
    });

    if (allStar) {
      if (!existing) {
        try {
          existing = await SpinCredit.create({
            student: studentId,
            weekStart,
            weekEnd,
            status: 'earned',
            eligibilitySnapshot: {
              quizCount: weekQuizzes.length,
              courseIds: courseIdsForWeek,
            },
            earnedAt: now,
          });
        } catch (error) {
          if (error?.code !== 11000) throw error;
          existing = await SpinCredit.findOne({
            student: studentId,
            weekStart,
          });
        }
      } else if (existing.status === 'revoked') {
        existing.status = 'earned';
        existing.earnedAt = now;
        existing.processingAt = null;
        existing.eligibilitySnapshot = {
          quizCount: weekQuizzes.length,
          courseIds: courseIdsForWeek,
        };
        await existing.save();
      } else if (existing.status === 'earned') {
        existing.eligibilitySnapshot = {
          quizCount: weekQuizzes.length,
          courseIds: courseIdsForWeek,
        };
        await existing.save();
      }
    } else if (
      existing &&
      ['earned', 'processing'].includes(existing.status) &&
      !existing.rewardAssignment
    ) {
      existing.status = 'revoked';
      existing.processingAt = null;
      await existing.save();
    }

    if (existing) {
      synced.push(existing);
    }
  }

  return synced;
}

function weightedRandomReward(candidates) {
  const total = candidates.reduce(
    (sum, item) => sum + Number(item.quantityRemaining || 0),
    0,
  );

  if (total <= 0) return null;

  let cursor = Math.random() * total;

  for (const item of candidates) {
    cursor -= Number(item.quantityRemaining || 0);

    if (cursor < 0) {
      return item;
    }
  }

  return candidates[candidates.length - 1] || null;
}

async function reserveRewardInventory() {
  await expireRewards();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const now = new Date();

    const candidates = await RewardCard.find({
      status: 'active',
      quantityRemaining: { $gt: 0 },
      $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } },
      ],
    })
      .select(
        'partnerName partnerLogoUrl title offer description instructions redemptionCode expiresAt quantityRemaining',
      )
      .lean();

    if (!candidates.length) {
      throw new HttpError(
        409,
        'No Bastly Cards are available right now. Your spin has not been used.',
      );
    }

    const chosen = weightedRandomReward(candidates);

    if (!chosen) {
      continue;
    }

    const reserved = await RewardCard.findOneAndUpdate(
      {
        _id: chosen._id,
        status: 'active',
        quantityRemaining: { $gt: 0 },
        $or: [
          { expiresAt: null },
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: now } },
        ],
      },
      {
        $inc: {
          quantityRemaining: -1,
        },
      },
      {
        new: true,
      },
    );

    if (reserved) {
      return reserved;
    }
  }

  throw new HttpError(
    409,
    'Reward inventory changed while you were spinning. Try again — your spin is safe.',
  );
}

function rewardSnapshot(reward) {
  return {
    partnerName: reward.partnerName,
    partnerLogoUrl: reward.partnerLogoUrl || '',
    title: reward.title,
    offer: reward.offer,
    description: reward.description || '',
    instructions: reward.instructions || '',
    redemptionCode: reward.redemptionCode || '',
  };
}

export async function spinForStudent(studentId) {
  await syncStudentSpinCredits(studentId);

  const credit = await SpinCredit.findOneAndUpdate(
    {
      student: studentId,
      status: 'earned',
    },
    {
      $set: {
        status: 'processing',
        processingAt: new Date(),
      },
    },
    {
      new: true,
      sort: {
        weekStart: 1,
      },
    },
  );

  if (!credit) {
    throw new HttpError(409, 'You do not have an available Bastly Spin.');
  }

  let reservedReward = null;
  let assignment = null;

  try {
    reservedReward = await reserveRewardInventory();

    assignment = await RewardAssignment.create({
      student: studentId,
      spinCredit: credit._id,
      rewardCard: reservedReward._id,
      rewardSnapshot: rewardSnapshot(reservedReward),
      assignedAt: new Date(),
      expiresAt: reservedReward.expiresAt || null,
      status: 'assigned',
    });

    const consumedCredit = await SpinCredit.findOneAndUpdate(
      {
        _id: credit._id,
        student: studentId,
        status: 'processing',
      },
      {
        $set: {
          status: 'consumed',
          consumedAt: new Date(),
          processingAt: null,
          rewardAssignment: assignment._id,
        },
      },
      {
        new: true,
      },
    );

    if (!consumedCredit) {
      throw new Error('Spin credit lock was lost before completion.');
    }

    return {
      credit: consumedCredit,
      assignment,
    };
  } catch (error) {
    if (assignment?._id) {
      await RewardAssignment.deleteOne({
        _id: assignment._id,
        spinCredit: credit._id,
      });
    }

    if (reservedReward?._id) {
      await RewardCard.updateOne(
        { _id: reservedReward._id },
        {
          $inc: {
            quantityRemaining: 1,
          },
        },
      );
    }

    await SpinCredit.updateOne(
      {
        _id: credit._id,
        status: 'processing',
      },
      {
        $set: {
          status: 'earned',
          processingAt: null,
          rewardAssignment: null,
        },
      },
    );

    throw error;
  }
}

export async function studentRewardDashboard(studentId) {
  await Promise.all([
    expireRewards(),
    syncStudentSpinCredits(studentId),
  ]);

  const [credits, assignments, wheelRewards] = await Promise.all([
    SpinCredit.find({
      student: studentId,
      status: { $in: ['earned', 'consumed'] },
    })
      .populate(
        'rewardAssignment',
        'status assignedAt expiresAt rewardSnapshot',
      )
      .sort({ weekStart: -1 })
      .lean(),

    RewardAssignment.find({
      student: studentId,
    })
      .sort({ assignedAt: -1 })
      .lean(),

    RewardCard.find({
      status: 'active',
      quantityRemaining: { $gt: 0 },
      $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    })
      .select(
        'partnerName partnerLogoUrl title offer quantityRemaining expiresAt',
      )
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(),
  ]);

  return {
    credits,
    availableSpinCount: credits.filter(
      (credit) => credit.status === 'earned',
    ).length,
    assignments,
    wheelRewards: wheelRewards.map((reward) => ({
      _id: reward._id,
      partnerName: reward.partnerName,
      partnerLogoUrl: reward.partnerLogoUrl || '',
      title: reward.title,
      offer: reward.offer,
      expiresAt: reward.expiresAt,
    })),
  };
}

export async function redeemStudentAssignment(studentId, assignmentId) {
  await expireRewards();

  const assignment = await RewardAssignment.findOne({
    _id: assignmentId,
    student: studentId,
  });

  if (!assignment) {
    throw new HttpError(404, 'Bastly Card not found.');
  }

  if (assignment.status === 'expired') {
    throw new HttpError(409, 'This Bastly Card has expired.');
  }

  if (assignment.status === 'redeemed') {
    throw new HttpError(409, 'This Bastly Card is already marked as used.');
  }

  assignment.status = 'redeemed';
  assignment.redeemedAt = new Date();
  await assignment.save();

  return assignment;
}

export async function expireRewardRecords() {
  return expireRewards();
}
