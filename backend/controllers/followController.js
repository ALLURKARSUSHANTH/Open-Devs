const User = require("../models/User");

exports.follow = async (req, res) => {
  try {
    const { userId } = req.body;
    const followUserId = req.params.id; 

    if (!userId || !followUserId) {
      return res.status(400).json({ message: "Missing user ID or follow user ID" });
    }

    if (userId === followUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const followUser = await User.findById(followUserId);

    if (!user || !followUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.following.includes(followUserId);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter((id) => id !== followUserId);
      followUser.followers = followUser.followers.filter((id) => id !== userId);
      await user.save();
      await followUser.save();
      return res.status(200).json({ message: "User unfollowed" });
    } else {
      // Follow
      user.following.push(followUserId);
      followUser.followers.push(userId);
      await user.save();
      await followUser.save();
      return res.status(200).json({ message: "User followed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
