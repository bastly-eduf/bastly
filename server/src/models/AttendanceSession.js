import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      trim: true,
      maxlength: 180,
      default: '',
    },
    heldAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'finalized'],
      default: 'draft',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

attendanceSessionSchema.index({ group: 1, heldAt: -1 });
attendanceSessionSchema.index({ course: 1, heldAt: -1, status: 1 });

export default mongoose.model('AttendanceSession', attendanceSessionSchema);
