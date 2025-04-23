const mongoose = require('mongoose');

// Mentor schema
const Mentor = new mongoose.Schema({
  _id: { type: String, required: true, ref: 'User' }, // Reference to User model
  mentees: [{ type: String, ref: 'User' }],  // List of mentees' userIds
  menteeRequests: [{ menteeId: { type: String, ref: 'User', required: true } }],
  status: { type: String, default: 'available' },
  reviews: [{ // New field to store reviews from mentees
    menteeId: { type: String, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },  // Rating between 1 to 5
    feedback: { type: String, required: true },  // Feedback text
    createdAt: { type: Date, default: Date.now }  // Timestamp of the review
  }]
});

module.exports = mongoose.model('Mentor', Mentor);
