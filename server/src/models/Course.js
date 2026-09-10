import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    doctorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
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
    level: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    curriculum: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      enum: ['EGP'],
      default: 'EGP',
    },
    priceConfirmed: {
      type: Boolean,
      default: false,
    },
    accessEndDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.index({ doctorProfile: 1, academicYear: 1, status: 1 });

export default mongoose.model('Course', courseSchema);
