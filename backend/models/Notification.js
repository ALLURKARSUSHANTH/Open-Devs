const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      ref: 'User', 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    senderId: { 
      type: String, 
      ref: 'User', 
      required: true 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    type: { 
      type: String, 
      enum: ['connectionRequest', 'newFollower', 'message','menteeRequest'], // Add more types as needed
      required: true 
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete notifications after 24 hours
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 86400 seconds = 24 hours

module.exports = mongoose.model('Notification', notificationSchema);