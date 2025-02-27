const User = require("../models/User");
const Notification = require("../models/Notification");

// Send a connection request

exports.sendConnectionRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const targetUserId = req.params.id;

    if (!senderId || !targetUserId) {
      return res.status(400).json({ message: "Missing sender ID or target user ID" });
    }

    if (senderId === targetUserId) {
      return res.status(400).json({ message: "You cannot send a connection request to yourself" });
    }

    const sender = await User.findById(senderId);
    const targetUser = await User.findById(targetUserId);

    if (!sender || !targetUser) {
      return res.status(404).json({ message: "Sender or target user not found" });
    }

    const isRequestSent = targetUser.connectionRequests.includes(senderId);

    if (isRequestSent) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    targetUser.connectionRequests.push(senderId);
    await targetUser.save();

    // Create a notification for the target user
    const notification = new Notification({
      userId: targetUserId,
      message: `${sender.username} sent you a connection request.`,
      senderId: senderId,
    });
    await notification.save();

    return res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Error in sendConnectionRequest function:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("connections").populate("connections", "name displayName photoURL");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ connections: user.connections });
  } catch (error) {
    console.error("Error getting connections:", error);
    res.status(500).json({ message: "Failed to fetch connections" });
  }
};


exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body; // ID of the user who is accepting the request
    const senderId = req.params.senderId; // ID of the user who sent the request

    // Validate userId and senderId
    if (!userId || !senderId) {
      return res.status(400).json({ message: "Missing user ID or sender ID" });
    }

    // Find the user who is accepting the request
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the user who sent the request
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Check if the sender's ID is in the user's connectionRequests array
    const isRequestPending = user.connectionRequests.includes(senderId);
    if (!isRequestPending) {
      return res.status(400).json({ message: "No pending connection request from this user" });
    }

    // Remove the sender's ID from the user's connectionRequests array
    user.connectionRequests = user.connectionRequests.filter(
      (id) => id.toString() !== senderId
    );

    // Add the sender's ID to the user's connections array
    user.connections.push(senderId);

    // Add the user's ID to the sender's connections array
    sender.connections.push(userId);

    // Save both users
    await user.save();
    await sender.save();

    // Mark the notification as read (optional)
    await Notification.updateMany(
      { userId: userId, senderId: senderId },
      { $set: { isRead: true } }
    );

    // Send a success response
    res.status(200).json({ message: "Connection request accepted successfully" });
  } catch (error) {
    console.error("Error accepting connection request:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.rejectConnectionRequest = async (req, res) => {
try {
  const { userId } = req.body; // ID of the user rejecting the request
  const senderId = req.params.senderId; // ID of the user who sent the request

  if (!userId || !senderId) {
    return res.status(400).json({ message: "Missing user ID or sender ID" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isRequestPending = user.connectionRequests.includes(senderId);
  if (!isRequestPending) {
    return res.status(400).json({ message: "No pending connection request from this user" });
  }

  user.connectionRequests = user.connectionRequests.filter(
    (id) => id.toString() !== senderId
  );

  await user.save();

  await Notification.deleteMany({ userId: userId, senderId: senderId });

  res.status(200).json({ message: "Connection request rejected successfully" });
} catch (error) {
  console.error("Error rejecting connection request:", error);
  res.status(500).json({ error: error.message });
}
};

// Remove a connection between two users
exports.removeConnection = async (req, res) => {
  try {
    const { userId } = req.body; // ID of the logged-in user
    const connectionId = req.params.connectionId; // ID of the user to remove from connections

    // Validate userId and connectionId
    if (!userId || !connectionId) {
      return res.status(400).json({ message: "Missing user ID or connection ID" });
    }

    // Find the logged-in user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the connection user
    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }

    // Check if the connection exists in the logged-in user's connections array
    const isConnectionExists = user.connections.includes(connectionId);
    if (!isConnectionExists) {
      return res.status(400).json({ message: "Connection does not exist" });
    }

    // Remove the connection from both users
    user.connections = user.connections.filter(
      (id) => id.toString() !== connectionId
    );
    connectionUser.connections = connectionUser.connections.filter(
      (id) => id.toString() !== userId
    );

    // Save both users
    await user.save();
    await connectionUser.save();

    // Send a success response
    res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("Error removing connection:", error);
    res.status(500).json({ error: error.message });
  }
};