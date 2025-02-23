const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: 'User', required: true },
    message: { type: String, required: true },
    senderId: { type: String, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Create a TTL index on the createdAt field, with a 24-hour expiration time (in seconds)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 86400 seconds = 24 hours

module.exports = mongoose.model('Notification', notificationSchema);
