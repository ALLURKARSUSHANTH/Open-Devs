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

    const [user, followUser] = await Promise.all([
      User.findById(userId),
      User.findById(followUserId)
    ]);

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
    const user = await User.findById(id)
      .select("followers")
      .populate("followers", "name displayName photoURL");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      followers: user.followers, // Return the followers array
    });

  } catch (error) {
    console.error("Error getting followers count:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeFollower = async (req, res) => {
  try {
    const { userId } = req.body; // ID of the logged-in user
    const followerId = req.params.followerId; // ID of the user to remove from followers

    // Validate userId and followerId
    if (!userId || !followerId) {
      return res.status(400).json({ message: "Missing user ID or follower ID" });
    }

    // Check if the user is trying to unfollow themselves
    if (userId === followerId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    // Find the logged-in user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the follower user
    const followerUser = await User.findById(followerId);
    if (!followerUser) {
      return res.status(404).json({ message: "Follower user not found" });
    }

    // Check if the follower exists in the logged-in user's following array
    const isFollowing = user.followers.includes(followerId);
    if (!isFollowing) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    // Remove the follower from both users
    user.followers = user.followers.filter(
      (id) => id.toString() !== followerId
    );
    followerUser.following = followerUser.following.filter(
      (id) => id.toString() !== userId
    );

    // Save both users
    await user.save();
    await followerUser.save();

    // Send a success response
    res.status(200).json({ message: "Follower removed successfully" });
  } catch (error) {
    console.error("Error removing follower:", error);
    res.status(500).json({ error: error.message });
  }
};