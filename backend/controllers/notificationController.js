const User = require('../models/User');
const Notification = require('../models/Notification');
const {io} = require('../socket');

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