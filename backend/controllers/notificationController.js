const User = require('../models/User');
const Notification = require('../models/Notification');

// Fetch notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .populate('senderId', 'displayName');
      console.log("User ID:", userId);
      console.log("Notifications:", notifications);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Accept a connection request

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