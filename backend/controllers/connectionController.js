const User = require('../models/User');
const Notification = require('../models/Notification');

module.exports = (io) => {
  const sendConnectionRequest = async (req, res) => {
    try {
      const { senderId } = req.body;
      const targetUserId = req.params.id;

      if (!senderId || !targetUserId) {
        return res.status(400).json({ message: 'Missing sender ID or target user ID' });
      }

      if (senderId === targetUserId) {
        return res.status(400).json({ message: 'You cannot send a connection request to yourself' });
      }

      const sender = await User.findById(senderId);
      const targetUser = await User.findById(targetUserId);

      if (!sender || !targetUser) {
        return res.status(404).json({ message: 'Sender or target user not found' });
      }

      targetUser.connectionRequests.push(senderId);
      await targetUser.save();

      // Create a notification for the target user
      const notification = new Notification({
        userId: targetUserId,
        message: `${sender.username} sent you a connection request.`,
        senderId: senderId,
        type: 'connectionRequest', // Add the type field
      });
      await notification.save();

      // Emit a notification to the target user
      io.to(targetUserId).emit('newNotification', {
        ...notification.toObject(),
        senderId: { _id: sender._id, displayName: sender.displayName, photoURL: sender.photoURL },
      });

      return res.status(200).json({ message: 'Connection request sent successfully' });
    } catch (error) {
      console.error('Error in sendConnectionRequest function:', error);
      res.status(500).json({ error: error.message });
    }
  };

  const getConnections = async (req, res) => {
    try {
      const { id } = req.params;

      // Find the user and populate the connections array with user details
      const user = await User.findById(id).populate('connections', 'displayName photoURL');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the connections array with user details
      return res.status(200).json({ connections: user.connections, count: user.connections.length });
    } catch (error) {
      console.error('Error getting connections:', error);
      res.status(500).json({ error: error.message });
    }
  };

  const removeConnection = async (req, res) => {
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

  return {
    sendConnectionRequest,
    getConnections,
    removeConnection,
  };
};