import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      default: ''
    },
    audioUrl: {
      type: String,
    },
    stickerUrl: {
      type: String,
    },
    mediaData: { 
      type: String,
    },
    type: {
      type: String,
      enum: ['text', 'audio', 'sticker', 'image', 'video', 'file'],
      default: 'text'
    },
    chatType: {
      type: String,
      enum: ['global', 'group', 'private'],
      default: 'global'
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ chatType: 1, createdAt: -1 });

export default mongoose.model("Message", MessageSchema);