const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  message: { type: String, required: true },
  senderId: { type: String, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});



module.exports = mongoose.model('Notification', notificationSchema);