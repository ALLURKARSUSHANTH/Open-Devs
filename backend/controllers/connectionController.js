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

// Get the number of connections (followers) for a user
exports.getConnectionsCount = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ connectionsCount: user.connections.length });
  } catch (error) {
    console.error("Error getting connections count:", error);
    res.status(500).json({ error: error.message });
  }
};
