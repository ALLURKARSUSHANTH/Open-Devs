const User = require("../models/User");

exports.follow = async (req, res) => {
  try {
    const { userId } = req.body;
    const followUserId = req.params.id;

    console.log("Follow Request Received");
    console.log("User ID:", userId);
    console.log("Follow User ID:", followUserId);

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

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    if (!followUser) {
      console.log("Follow user not found:", followUserId);
      return res.status(404).json({ message: "Follow user not found" });
    }

    const isFollowing = user.following.includes(followUserId);

    await User.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: isFollowing ? { $pull: { following: followUserId } } : { $addToSet: { following: followUserId } }
        }
      },
      {
        updateOne: {
          filter: { _id: followUserId },
          update: isFollowing ? { $pull: { followers: userId } } : { $addToSet: { followers: userId } }
        }
      }
    ]);

    return res.status(200).json({ message: isFollowing ? "User unfollowed" : "User followed" });
  } catch (error) {
    console.error("Error in follow function:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("followers").populate("followers", "name displayName photoURL");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ followers: user.followers });
  } catch (error) {
    console.error("Error getting followers:", error);
    res.status(500).json({ message: "Failed to fetch followers" });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("following").populate("following", "name displayName photoURL");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ following: user.following });
  } catch (error) {
    console.error("Error getting following:", error);
    res.status(500).json({ message: "Failed to fetch following" });
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