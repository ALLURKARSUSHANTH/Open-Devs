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



