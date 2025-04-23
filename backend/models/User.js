const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String ,default: ''},
  displayName: { type: String }, 
  role : { type: String, default: 'user' },
  points: { 
    type: Number, 
    default: 0,
    min: 0
  },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master'],
    default: 'beginner'
  },
  lastLogin: String, // For tracking daily login
  achievements: [{
    name: String,
    date: { type: Date, default: Date.now }
  }],
  skills : [{ type: String }],
  followers: [{ type: String, ref: 'User' }],
  following: [{ type: String, ref: 'User' }],
  connections:[{type: String,ref: 'User'}],
  connectionRequests: [{ type: String, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

UserSchema.methods.addPoints = async function(points) {
  this.points += points;
  const newLevel = getCurrentLevel(this.points);
  if (newLevel !== this.level) {
    this.level = newLevel;
    this.achievements.push({ name: `Reached ${newLevel} level` });
  }
  await this.save();
  return this;
};

module.exports = mongoose.model('User', UserSchema);
