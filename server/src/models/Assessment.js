import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['mcq', 'true_false'], required: true },
    prompt: { type: String, required: true, trim: true, maxlength: 2000 },
    options: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 2 && value.length <= 6;
        },
        message: 'Questions must have between 2 and 6 options.',
      },
    },
    correctOptionIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true, maxlength: 2000, default: '' },
    points: { type: Number, min: 1, max: 100, default: 1 },
  },
  { _id: true },
);

questionSchema.pre('validate', function validateAnswer(next) {
  if (!Array.isArray(this.options) || this.correctOptionIndex >= this.options.length) {
    this.invalidate('correctOptionIndex', 'Correct answer must point to an option.');
  }
  next();
});

const assessmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    type: { type: String, enum: ['quiz', 'homework'], required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 4000, default: '' },
    instructions: { type: String, trim: true, maxlength: 3000, default: '' },
    questions: { type: [questionSchema], default: [] },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

assessmentSchema.index({ course: 1, type: 1, status: 1, createdAt: -1 });

export default mongoose.model('Assessment', assessmentSchema);
