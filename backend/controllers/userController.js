const User = require('../models/User');

exports.createOrGetUser = async (req, res) => {
  const { _id, email, displayName,photoURL} = req.body;
  try {
    let user = await User.findOne({ _id }); 
    if (!user) {
      user = new User({ _id, email, displayName,photoURL : photoURL || "" });
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
    user.displayName = displayName || user.displayName;
    user.photoURL = photoURL || user.photoURL;
    user.skills = skills || user.skills;
    await user.save();
    return res.json(user);
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.searchUser = async (req, res) => {
  const { query } = req.params;
  try {
    const users = await User.find({ displayName: { $regex: query, $options: "i" } });
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
