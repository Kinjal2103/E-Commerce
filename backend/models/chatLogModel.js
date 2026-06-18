const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required.'],
      trim: true
    },
    userMessage: {
      type: String,
      required: [true, 'User message content is required.'],
      trim: true
    },
    aiResponse: {
      type: String,
      required: [true, 'AI response content is required.'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

chatLogSchema.index({ sessionId: 1, createdAt: 1 });
chatLogSchema.index({ userId: 1 });

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

module.exports = ChatLog;
