const User = require("../models/User");

// Send a connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const targetUserId = req.params.id;

    console.log("Connection Request Received");
    console.log("Sender ID:", senderId);
    console.log("Target User ID:", targetUserId);

    // Validate senderId and targetUserId
    if (!senderId || !targetUserId) {
      return res.status(400).json({ message: "Missing sender ID or target user ID" });
    }

    // Prevent users from sending requests to themselves
    if (senderId === targetUserId) {
      return res.status(400).json({ message: "You cannot send a connection request to yourself" });
    }

    // Find sender and target user in the database
    const sender = await User.findById(senderId);
    const targetUser = await User.findById(targetUserId);

    // Validate sender and target user existence
    if (!sender) {
      console.log("Sender not found:", senderId);
      return res.status(404).json({ message: "Sender not found" });
    }
    if (!targetUser) {
      console.log("Target user not found:", targetUserId);
      return res.status(404).json({ message: "Target user not found" });
    }

    // Check if a connection request has already been sent
    const isRequestSent = targetUser.connectionRequests.includes(senderId);

    if (isRequestSent) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    // Add the request to the target user's connectionRequests array
    targetUser.connectionRequests.push(senderId);
    await targetUser.save();

    return res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Error in sendConnectionRequest function:", error);
    res.status(500).json({ error: error.message });
  }
};

// Accept a connection request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const requestUserId = req.params.id;

    console.log("Accept Connection Request Received");
    console.log("User ID:", userId);
    console.log("Request User ID:", requestUserId);

    if (!userId || !requestUserId) {
      return res.status(400).json({ message: "Missing user ID or request user ID" });
    }

    if (userId === requestUserId) {
      return res.status(400).json({ message: "You cannot accept a request from yourself" });
    }

    const user = await User.findById(userId);
    const requestUser = await User.findById(requestUserId);

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    if (!requestUser) {
      console.log("Request user not found:", requestUserId);
      return res.status(404).json({ message: "Request user not found" });
    }

    const isRequestPending = user.connectionRequests.includes(requestUserId);

    if (!isRequestPending) {
      return res.status(400).json({ message: "No pending connection request from this user" });
    }

    // Remove the request from the connectionRequests array
    user.connectionRequests = user.connectionRequests.filter(
      (id) => id.toString() !== requestUserId
    );

    // Add each user to the other's connections array
    user.connections.push(requestUserId);
    requestUser.connections.push(userId);

    // Save both users
    await user.save();
    await requestUser.save();

    return res.status(200).json({ message: "Connection request accepted successfully" });
  } catch (error) {
    console.error("Error in acceptConnectionRequest function:", error);
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