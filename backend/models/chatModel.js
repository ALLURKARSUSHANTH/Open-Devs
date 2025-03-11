const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: { type: String, required: true, ref: 'User' }, // Firebase UID of the sender
  receiverId: { type: String, required: true, ref: 'User' }, // Firebase UID of the receiver
  message: { type: String, required: true }, // Message content
  isRead: { type: Boolean, default: false }, // Whether the message has been read
  createdAt: { type: Date, default: Date.now }, // Timestamp of the message
});

module.exports = mongoose.model('Chat', chatSchema);