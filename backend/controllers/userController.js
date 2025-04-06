const User = require('../models/User');
const {POINT_RULES,getCurrentLevel} = require('../utils/levels');


exports.createOrGetUser = async (req, res) => {
  const { _id, email, displayName, photoURL } = req.body;
  
  try {
    let user = await User.findOne({ _id });
    
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // If user exists with same email but different _id, update the _id
        user._id = _id;
        await user.save();
      } else {
        user = new User({ 
          _id, 
          email, 
          displayName: displayName || "User", 
          photoURL: photoURL || "",
          skills: []
        });
        await user.save();
      }
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in createOrGetUser:", error);
    return res.status(500).json({ 
      error: error.message,
      code: error.code 
    });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ points: -1 })
      .limit(100)
      .select('displayName photoURL points level');
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.dailyLogin = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already logged in today
    const today = new Date().toDateString();
    if (user.lastLogin === today) {
      return res.status(400).json({ message: "Already logged in today" });
    }

    user.points += POINT_RULES.dailyLogin;
    user.lastLogin = today;
    
    const newLevel = getCurrentLevel(user.points);
    if (newLevel !== user.level) {
      user.level = newLevel;
    }
    
    await user.save();
    res.status(200).json({ 
      message: "Daily login bonus awarded",
      points: user.points,
      level: user.level
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { displayName, skills } = req.body;
  const { file } = req;

  try {
    let photoURL = req.body.photoURL; // Default to existing or provided URL

    // If a new image was uploaded, replace photoURL with the new one
    if (file) {
      const base64Image = file.buffer.toString("base64");

      try {
        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          new URLSearchParams({ image: base64Image }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        console.log("Uploaded image URL:", response.data.data.url);
        photoURL = response.data.data.url; 
      } catch (error) {
        console.error("Error uploading image:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to upload profile picture" });
      }
    }

    // Find and update the user
    const user = await User.findById(req.params.firebaseUid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields if provided
    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL; 
    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.searchUser = async (req, res) => {
  const { query } = req.params;
  try {
    const users = await User.find({ 
      $or: [
        { displayName: { $regex: query, $options: "i" } },
        { skills: { $regex: query, $options: "i" } }
      ]
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getUserByFirebaseUid = async (req, res) => {
  try {
    const user = await User.findById(req.params.firebaseUid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// controllers/userController.js
exports.addUserSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const { firebaseUid } = req.params;

    const user = await User.findOneAndUpdate(
      { _id: firebaseUid },
      { $addToSet: { skills: { $each: skills } } }, // Prevents duplicates
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/*exports.removeUserSkill = async (req, res) => {
  const { skill } = req.body;
  try {
    const user = await User.findById(req.params.firebaseUid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.skills = user.skills.filter(s => s !== skill);
    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};*/
