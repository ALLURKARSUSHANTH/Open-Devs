const mongoose = require('mongoose');

// Mentee schema
const Mentee = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' }, 
  mentor: { type: String, ref: 'User' },
  status: { type: String, default: 'No mentor' }
});

module.exports = mongoose.model('Mentee', Mentee);