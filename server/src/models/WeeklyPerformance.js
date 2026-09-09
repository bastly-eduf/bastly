import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    available: { type: Boolean, default: false },
    assigned: { type: Number, min: 0, default: 0 },
    completed: { type: Number, min: 0, default: 0 },
    score: { type: Number, min: 0, max: 100, default: null },
    weightUsed: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

const weeklyPerformanceSchema = new mongoose.Schema(
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
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },
    quiz: { type: categorySchema, default: () => ({}) },
    attendance: { type: categorySchema, default: () => ({}) },
    homework: { type: categorySchema, default: () => ({}) },
    overallPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
      index: true,
    },
    gradeBand: {
      type: String,
      enum: ['Star', 'A', 'B', 'C', null],
      default: null,
      index: true,
    },
    spinEligible: {
      type: Boolean,
      default: false,
      index: true,
    },
    spinReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

weeklyPerformanceSchema.index(
  { student: 1, course: 1, weekStart: 1 },
  { unique: true },
);
weeklyPerformanceSchema.index({ course: 1, weekStart: -1, overallPercentage: -1 });

export default mongoose.model('WeeklyPerformance', weeklyPerformanceSchema);
