import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
  },
  { _id: false },
);

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: '',
    },
    videoProvider: {
      type: String,
      enum: ['youtube'],
      default: 'youtube',
    },
    youtubeVideoId: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '',
    },
    durationMinutes: {
      type: Number,
      min: 0,
      max: 10000,
      default: null,
    },
    resources: {
      type: [resourceSchema],
      default: [],
    },
    sortOrder: {
      type: Number,
      min: 0,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

lessonSchema.index({ course: 1, module: 1, sortOrder: 1, status: 1 });

export default mongoose.model('Lesson', lessonSchema);
