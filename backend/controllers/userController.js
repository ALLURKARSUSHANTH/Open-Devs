// controllers/userController.js
const User = require('../models/User');

exports.createOrGetUser = async (req, res) => {
  const { _id, email, displayName, photoURL } = req.body;
  try {
    let user = await User.findOne({ _id });
    if (!user) {
      user = new User({ 
        _id, 
        email, 
        displayName, 
        photoURL: photoURL || "",
        skills: []  // Initialize with empty skills array
      });
      await user.save();
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { displayName, photoURL, skills } = req.body;
  try {
    const user = await User.findById(req.params.firebaseUid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL;
    if (skills) user.skills = skills;
    
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
