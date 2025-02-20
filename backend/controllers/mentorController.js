const mongoose = require('mongoose');
const User = require('../models/User');
const Mentor = require('../models/Mentor');

exports.applyForMentorship = async (req, res) => {
  try {
    const user = await User.findById(req.params.firebaseUid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.level === 'beginner') {
      res.status(400).json({ error: "User is not eligible to become a mentor" });
    } else if ((user.level === 'intermediate' && user.points >= 10000) || (user.level === 'advanced' && user.points >= 20000)) {
      res.send("Your application has been submitted successfully");
    } else {
      res.status(400).json({ error: "User is not eligible to become a mentor" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.createMentor = async (req, res) => {
  try {
    const user = await User.findById(req.params.firebaseUid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const mentor = await Mentor.create({ userId: req.params.firebaseUid });
    mentor.save();
    res.status(201).send(mentor);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find()
      .populate('userId', 'email displayName') 
      .exec();
    res.status(200).send(mentors);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getMentee = async (req, res) => {
    try {
      const currentUserId = req.params.firebaseUid;
  
      const mentor = await Mentor.findOne({ userId: currentUserId });
  
      if (!mentor) {
        return res.status(400).json({ error: "Only mentors can view their mentees" });
      }
  
      const mentees = await User.find({ _id: { $in: mentor.mentees } })
        .select('email displayName')
        .exec();
  
      res.status(200).send(mentees);
    } catch (error) {
      res.status(500).send(error);
    }
  };
  