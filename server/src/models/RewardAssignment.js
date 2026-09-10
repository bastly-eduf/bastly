import mongoose from 'mongoose';

const rewardSnapshotSchema = new mongoose.Schema(
  {
    partnerName: { type: String, required: true },
    partnerLogoUrl: { type: String, default: '' },
    title: { type: String, required: true },
    offer: { type: String, required: true },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    redemptionCode: { type: String, default: '' },
  },
  { _id: false },
);

const rewardAssignmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    spinCredit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpinCredit',
      required: true,
      unique: true,
      index: true,
    },
    rewardCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RewardCard',
      required: true,
      index: true,
    },
    rewardSnapshot: {
      type: rewardSnapshotSchema,
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'redeemed', 'expired'],
      default: 'assigned',
      index: true,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

rewardAssignmentSchema.index({ student: 1, status: 1, assignedAt: -1 });

export default mongoose.model('RewardAssignment', rewardAssignmentSchema);
