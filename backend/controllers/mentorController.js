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
    const mentor = await Mentor.create({ _id: req.params.firebaseUid });
    mentor.save();
    res.status(201).send(mentor);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find()
      .populate('_id', 'email displayName photoURL') 
      .exec();
    res.status(200).send(mentors);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.becomeMentee = async (req, res) => {
  try {
    const { mentorId, menteeId } = req.body;

    if (!mentorId || !menteeId) {
      return res.status(400).json({ error: "Mentor ID and Mentee ID are required" });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ error: "Mentee not found" });
    }

    if (mentor.mentees.includes(menteeId)) {
      return res.status(400).json({ error: "Mentee already exists" });
    }

    if (mentor.menteeRequests.includes(menteeId)) {
      return res.status(400).json({ error: "Mentee request already exists" });
    }

    // Add mentee to mentor's request list
    mentor.menteeRequests.push(menteeId);
    await mentor.save();

    return res.status(200).json({ message: "Mentee request sent successfully", mentor });
  } catch (error) {
    console.error("Error in becomeMentee:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.acceptMentee = async (req, res) => {
  try {
    const mentorId = req.params.firebaseUid;
    const menteeId = req.params.menteeId;
    const mentor = await Mentor.findOne({ _id: mentorId });
    if (!mentor) {
      return res.status(400).json({ error: "Mentor not found" });
    }
    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(400).json({ error: "Mentee not found" });
    }
    if (!mentor.menteeRequests.includes(menteeId)) {
      return res.status(400).json({ error: "Mentee request not found" });
    }
    mentor.menteeRequests = mentor.menteeRequests.filter((id) => id !== menteeId);
    mentor.mentees.push(menteeId);
    await mentor.save();
    res.status(200).send(mentor);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.rejectMentee = async (req, res) => {
  try {
    const mentorId = req.params.firebaseUid;
    const menteeId = req.params.menteeId;
    const mentor = await Mentor.findOne({ _id: mentorId });
    if (!mentor) {
      return res.status(400).json({ error: "Mentor not found" });
    }
    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(400).json({ error: "Mentee not found" });
    }
    if (!mentor.menteeRequests.includes(menteeId)) {
      return res.status(400).json({ error: "Mentee request not found" });
    }
    mentor.menteeRequests = mentor.menteeRequests.filter((id) => id !== menteeId);
    await mentor.save();
    res.status(200).send(mentor);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getMentee = async (req, res) => {
    try {
      const currentUserId = req.params.firebaseUid;
  
      const mentor = await Mentor.findOne({ _id: currentUserId });
  
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
  