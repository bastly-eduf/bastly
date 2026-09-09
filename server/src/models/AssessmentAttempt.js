import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOptionIndex: { type: Number, min: 0, required: true },
    isCorrect: { type: Boolean, required: true },
    pointsAwarded: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const attemptSchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true, index: true },
    attemptNumber: { type: Number, min: 1, required: true },
    answers: { type: [answerSchema], default: [] },
    scorePoints: { type: Number, min: 0, required: true },
    maxPoints: { type: Number, min: 0, required: true },
    percentage: { type: Number, min: 0, max: 100, required: true, index: true },
    gradeBand: { type: String, enum: ['Star', 'A', 'B', 'C'], required: true, index: true },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

attemptSchema.index({ assessment: 1, student: 1, attemptNumber: 1 }, { unique: true });
attemptSchema.index({ student: 1, submittedAt: -1 });

export default mongoose.model('AssessmentAttempt', attemptSchema);
