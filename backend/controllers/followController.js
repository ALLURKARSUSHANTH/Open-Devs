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

    // Access the `io` instance from the app
    const io = req.app.get('io');

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(userId, { $pull: { following: followUserId } });
      await User.findByIdAndUpdate(followUserId, { $pull: { followers: userId } });

      // Emit an "unfollow" event to the backend socket server
      if (io) {
        io.to(followUserId).emit('unfollow', {
          userId: userId, // The user who is unfollowing
          followUserId: followUserId, // The user being unfollowed
        });
      }

      return res.status(200).json({ message: "User unfollowed" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(userId, { $addToSet: { following: followUserId } });
      await User.findByIdAndUpdate(followUserId, { $addToSet: { followers: userId } });

      // Emit a "follow" event to the backend socket server
      if (io) {
        io.to(followUserId).emit('follow', {
          userId: userId, // The user who is following
          followUserId: followUserId, // The user being followed
        });
      }

      return res.status(200).json({ message: "User followed" });
    }
  } catch (error) {
    console.error("Error in follow function:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ followersCount: user.followers });
  } catch (error) {
    console.error("Error getting followers count:", error);
    res.status(500).json({ error: error.message });
  }
};