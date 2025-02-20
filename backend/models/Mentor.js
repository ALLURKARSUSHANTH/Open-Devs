const mongoose = require('mongoose');

// Mentor schema
const Mentor = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' }, // Reference to User model
  mentees: [{ type: String, ref: 'User' }],  // List of mentees' userIds
  status: { type: String, default: 'available' }
});

module.exports = mongoose.model('Mentor', Mentor);
