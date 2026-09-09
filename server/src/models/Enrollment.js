import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { _id: false },
);

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'unregistered', 'expired', 'completed'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['whatsapp_manual'],
      default: 'whatsapp_manual',
    },
    pricePaid: {
      type: Number,
      min: 0,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    accessStartDate: {
      type: Date,
      default: null,
    },
    accessEndDate: {
      type: Date,
      default: null,
      index: true,
    },
    unregisteredAt: {
      type: Date,
      default: null,
    },
    unregisteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index(
  { student: 1, course: 1, group: 1 },
  { unique: true },
);
enrollmentSchema.index({ course: 1, group: 1, status: 1 });

export default mongoose.model('Enrollment', enrollmentSchema);
