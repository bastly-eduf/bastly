import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    school: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    academicLevel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    studentCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('StudentProfile', studentProfileSchema);
