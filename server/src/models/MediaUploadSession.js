import mongoose from 'mongoose';

const expectedFileSchema = new mongoose.Schema(
  {
    variant: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 700,
    },
    width: {
      type: Number,
      required: true,
      min: 1,
    },
    height: {
      type: Number,
      required: true,
      min: 1,
    },
    bytes: {
      type: Number,
      required: true,
      min: 1,
    },
    maxBytes: {
      type: Number,
      required: true,
      min: 1,
    },
    contentType: {
      type: String,
      enum: ['image/webp'],
      default: 'image/webp',
    },
  },
  { _id: false },
);

const mediaUploadSessionSchema = new mongoose.Schema(
  {
    uploadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['doctor', 'reward'],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    slot: {
      type: String,
      enum: ['portrait', 'rewardImage', 'partnerLogo'],
      required: true,
    },
    files: {
      type: [expectedFileSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'At least one media file is required.',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'committed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0,
      },
    },
    committedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

mediaUploadSessionSchema.index({
  actor: 1,
  status: 1,
  createdAt: -1,
});

export default mongoose.model(
  'MediaUploadSession',
  mediaUploadSessionSchema,
);
