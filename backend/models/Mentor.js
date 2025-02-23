const mongoose = require('mongoose');

// Mentor schema
const Mentor = new mongoose.Schema({
  _id: { type: String, required: true, ref: 'User' }, // Reference to User model
  mentees: [{ type: String, ref: 'User' }],  // List of mentees' userIds
  menteeRequests: [{ type: String, ref: 'User' }],
  status: { type: String, default: 'available' }
});

module.exports = mongoose.model('Mentor', Mentor);
