import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    scheduleLabel: {
      type: String,
      trim: true,
      maxlength: 240,
      default: '',
    },
    meetingUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

groupSchema.index({ course: 1, name: 1 }, { unique: true });

export default mongoose.model('Group', groupSchema);
