import mongoose from 'mongoose';

export const mediaVariantSchema = new mongoose.Schema(
  {
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
    contentType: {
      type: String,
      enum: ['image/webp'],
      default: 'image/webp',
    },
  },
  { _id: false },
);

export const mediaAssetSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['r2'],
      default: 'r2',
    },
    uploadId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    variants: {
      master: {
        type: mediaVariantSchema,
        default: null,
      },
      profile: {
        type: mediaVariantSchema,
        default: null,
      },
      card: {
        type: mediaVariantSchema,
        default: null,
      },
      thumb: {
        type: mediaVariantSchema,
        default: null,
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);
