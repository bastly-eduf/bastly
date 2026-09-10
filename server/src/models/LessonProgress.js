import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema(
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
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

lessonProgressSchema.index(
  { student: 1, lesson: 1 },
  { unique: true },
);

lessonProgressSchema.index({
  student: 1,
  course: 1,
  completed: 1,
});

export default mongoose.model('LessonProgress', lessonProgressSchema);
