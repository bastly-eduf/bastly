import mongoose from 'mongoose';

const parentRelationshipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    invitedName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    invitedEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    invitedPhone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'revoked'],
      default: 'pending',
      index: true,
    },
    linkedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

parentRelationshipSchema.index(
  { student: 1, invitedEmail: 1 },
  { unique: true },
);

export default mongoose.model('ParentRelationship', parentRelationshipSchema);
