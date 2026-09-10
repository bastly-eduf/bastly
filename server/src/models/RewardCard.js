import mongoose from 'mongoose';

const rewardCardSchema = new mongoose.Schema(
  {
    partnerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
      index: true,
    },
    partnerLogoUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    offer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2500,
      default: '',
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 2500,
      default: '',
    },
    redemptionCode: {
      type: String,
      trim: true,
      maxlength: 180,
      default: '',
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    quantityTotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    quantityRemaining: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'expired'],
      default: 'active',
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

rewardCardSchema.index({
  status: 1,
  quantityRemaining: 1,
  expiresAt: 1,
  sortOrder: 1,
});

export default mongoose.model('RewardCard', rewardCardSchema);
