import mongoose from 'mongoose';

const eligibilitySnapshotSchema = new mongoose.Schema(
  {
    quizCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    courseIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { _id: false },
);

const spinCreditSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['earned', 'processing', 'consumed', 'revoked'],
      default: 'earned',
      index: true,
    },
    eligibilitySnapshot: {
      type: eligibilitySnapshotSchema,
      default: () => ({}),
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    processingAt: {
      type: Date,
      default: null,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    rewardAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RewardAssignment',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

spinCreditSchema.index(
  { student: 1, weekStart: 1 },
  { unique: true },
);
spinCreditSchema.index({ student: 1, status: 1, weekStart: 1 });

export default mongoose.model('SpinCredit', spinCreditSchema);
