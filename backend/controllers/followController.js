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

    const user = await User.findById(userId);
    const followUser = await User.findById(followUserId);

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    if (!followUser) {
      console.log("Follow user not found:", followUserId);
      return res.status(404).json({ message: "Follow user not found" });
    }

    const isFollowing = user.following.includes(followUserId);

    if (isFollowing) {
      await User.findByIdAndUpdate(userId, { $pull: { following: followUserId } });
      await User.findByIdAndUpdate(followUserId, { $pull: { followers: userId } });
      return res.status(200).json({ message: "User unfollowed" });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { following: followUserId } });
      await User.findByIdAndUpdate(followUserId, { $addToSet: { followers: userId } });
      //creating notiofication using socket
      const io = req.app.get('io'); // Access the `io` instance from the app
      if (io) {
        // Emit the follow event
          io.to(followUserId).emit('follow', {
            followerId: userId,
            followerName: user.displayName || user.username,
            followerPhoto: user.photoURL, // Include photoURL
            message: `${user.displayName || user.username} started following you.`,
          });
        console.log(`Emitted newFollower event to ${followUserId}`);
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