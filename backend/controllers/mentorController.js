const mongoose = require('mongoose');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Notification = require('../models/Notification');
const {LEVEL_THRESHOLDS,getCurrentLevel} = require('../utils/levels');

exports.applyForMentorship = async (req, res) => {
  try {
    const user = await User.findById(req.params.firebaseUid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentLevel = getCurrentLevel(user.points);
    
    // Check eligibility based on level and points
    if (currentLevel === 'beginner') {
      return res.status(400).json({ 
        error: "User is not eligible to become a mentor",
        details: {
          currentLevel,
          currentPoints: user.points,
          requiredLevel: "intermediate",
          requiredPoints: LEVEL_THRESHOLDS.intermediate
        }
      });
    }

    if ((currentLevel === 'intermediate' && user.points >= LEVEL_THRESHOLDS.intermediate) || 
        (currentLevel === 'advanced' && user.points >= LEVEL_THRESHOLDS.advanced) ||
        (currentLevel === 'expert' && user.points >= LEVEL_THRESHOLDS.expert) ||
        (currentLevel === 'master' && user.points >= LEVEL_THRESHOLDS.master)) {
      
      // Check if user is already a mentor
      const existingMentor = await Mentor.findById(req.params.firebaseUid);
      if (existingMentor) {
        return res.status(400).json({ error: "User is already a mentor" });
      }

      // Create mentor profile - no need to save separately when using create()
      const mentor = await Mentor.create({
        _id: req.params.firebaseUid,
        mentees: [],
        menteeRequests: [],
        status: 'available',
        reviews: []
      });
      
      // Update user role to mentor
      user.role = 'mentor';
      user.level = currentLevel;
      await user.save();
      
      return res.status(201).json({ 
        success: true,
        message: "Mentor application approved and profile created successfully",
        mentor,
        user: {
          id: user._id,
          role: user.role,
          level: user.level
        }
      });
    }

    return res.status(400).json({ 
      error: "User is not eligible to become a mentor",
      details: {
        currentLevel,
        currentPoints: user.points,
        requiredPoints: currentLevel === 'intermediate' 
          ? LEVEL_THRESHOLDS.advanced 
          : LEVEL_THRESHOLDS.expert
      }
    });

  } catch (error) {
    console.error("Mentorship application error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getMentors = async (req, res) => {
  const {currentUserId} = req.query;
  try {
    const mentors = await Mentor.find({ _id: { $ne : currentUserId } })
      .populate('_id', 'email displayName photoURL skills level followers')
      .exec();
    res.status(200).send(mentors);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.becomeMentee = async (req, res) => {
  try {
    const mentorId = req.body.mentorId;
    const menteeId = req.body.menteeId

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

    // Check if mentee is already in mentees list
    if (mentor.mentees.includes(menteeId)) {
      return res.status(400).json({ error: "Mentee already exists" });
    }

    const hasExistingRequest = mentor.menteeRequests.some(
      request => request.menteeId.toString() === menteeId
    );

    if (hasExistingRequest) {
      return res.status(400).json({ error: "Mentee request already exists" });
    }
    // Add mentee to mentor's request list
    mentor.menteeRequests.push({ menteeId });
    await mentor.save();

    // Create notification
    const notification = new Notification({
      userId: mentorId,
      message: `${mentee.displayName} wants to be your mentee.`,
      senderId: menteeId,
      type: "menteeRequest"
    });
    await notification.save();

    return res.status(200).json({ 
      success: true,
      message: "Mentee request sent successfully",
      mentor 
    });
  } catch (error) {
    console.error("Error in becomeMentee:", error);
    return res.status(500).json({ error: "Internal server error" });
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
    await Notification.deleteMany({ userId: menteeId, 
      senderId: mentorId },
      { $set: { isRead: true, message: `Your mentee request to ${mentor.displayName} has been rejected.` } }
    );
   
    res.status(200).send(mentor);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.submitRating = async (req, res) => {
  try {
    const { mentorId, rating, feedback, menteeId } = req.body;

    if (!mentorId || !rating || !feedback || !menteeId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    // You can store the feedback and rating in a mentor's reviews array
    mentor.reviews.push({ rating, feedback, menteeId });
    await mentor.save();

    res.status(200).json({ message: "Rating and feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get mentor details with reviews and average rating
exports.getMentorDetails = async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Find the mentor by ID
    const mentor = await Mentor.findById(mentorId).populate('_id','reviews.menteeId', 'displayName'); // Populate menteeId with their displayName

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Calculate average rating
    const averageRating = mentor.reviews.length > 0 ? mentor.reviews.reduce((acc, review) => acc + review.rating, 0) / mentor.reviews.length : 0;

    // Return mentor details, reviews, and average rating
    res.status(200).json({
      mentor,
      averageRating,
      reviews: mentor.reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMentees = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId)
      .populate('mentees', 'displayName email photoURL bio skills createdAt');
    
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    res.status(200).json(mentor.mentees);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getMenteeRequests = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId)
      .select('menteeRequests')
      .lean();

    if (!mentor) return res.status(404).send('Mentor not found');

    // Process menteeRequests to normalize the data structure
    const processedRequests = await Promise.all(
      mentor.menteeRequests.map(async (request) => {
        // Handle string entries (like "user3")
        if (typeof request === 'string') {
          const user = await User.findById(request)
            .select('displayName email photoURL skills createdAt')
            .lean();
          return {
            _id: new mongoose.Types.ObjectId(), // Generate new ID for consistency
            createdAt: new Date(), // Use current date as fallback
            mentee: user || { _id: request, error: 'User not found' }
          };
        }
        
        if (request.menteeId) {
          // Handle string menteeId
          if (typeof request.menteeId === 'string') {
            const user = await User.findById(request.menteeId)
              .select('displayName email photoURL skills createdAt')
              .lean();
            return {
              _id: request._id,
              createdAt: request.createdAt,
              mentee: user || { _id: request.menteeId, error: 'User not found' }
            };
          }
          
          // Handle already populated menteeId (object)
          if (typeof request.menteeId === 'object') {
            return {
              _id: request._id,
              createdAt: request.createdAt,
              mentee: request.menteeId
            };
          }
        }
        
        // Fallback for invalid entries
        return {
          _id: request._id || new mongoose.Types.ObjectId(),
          createdAt: request.createdAt || new Date(),
          mentee: { error: 'Invalid request format' }
        };
      })
    );

    res.json(processedRequests);
  } catch (err) {
    console.error('Error fetching mentee requests:', err);
    res.status(500).json({ error: 'Failed to process mentee requests' });
  }
};

exports.acceptMenteeRequest = async (req, res) => {
  const { mentorId, menteeId } = req.params;

  try {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }
    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ error: "User not found" });
    }    
    
    // Add mentee if not already present
    if (!mentor.mentees.includes(menteeId)) {
      // Filter out any invalid requests (those without menteeId) before processing
      mentor.menteeRequests = mentor.menteeRequests.filter(request => 
        request && request.menteeId && request.menteeId.toString() !== menteeId
      );
      
      mentor.mentees.push(menteeId);
      mentee.role = 'mentee'; // Update mentee's role to 'mentee'
      
      await mentor.save();
      await mentee.save(); // Save mentee's updated role
    } else {
      return res.status(400).json({ error: "Mentee already exists" });
    }
    
    res.status(200).json({ success: true });
  } catch(err) {
    console.error("Error accepting mentee request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};