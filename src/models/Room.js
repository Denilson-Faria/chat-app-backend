
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['group', 'private', 'direct'],
      default: 'group',
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    description: {
      type: String,
      maxlength: 500,
    },
    avatar: {
      type: String,
    },
    lastMessage: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ name: 1 });
roomSchema.index({ members: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
