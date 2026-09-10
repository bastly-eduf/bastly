import mongoose from 'mongoose';

import { mediaAssetSchema } from './schemas/mediaAsset.schema.js';

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
      default: null,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    levels: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experience: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    imageMedia: {
      type: mediaAssetSchema,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
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

doctorProfileSchema.index({ isPublished: 1, sortOrder: 1, displayName: 1 });

export default mongoose.model('DoctorProfile', doctorProfileSchema);
