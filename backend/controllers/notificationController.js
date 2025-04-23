const User = require('../models/User');
const Notification = require('../models/Notification');
const {io} = require('../socket');

// Fetch notifications for a user
exports.getAllNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { lastId, limit = 10 } = req.query;

    // Base query
    const query = { userId };

    // Add cursor for pagination
    if (lastId) {
      // First get the createdAt timestamp of the last notification
      const lastNotification = await Notification.findById(lastId);
      if (lastNotification) {
        query.createdAt = { $lt: lastNotification.createdAt };
      }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('senderId', 'displayName photoURL');

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

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

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId, userId } = req.params;

    // Validate IDs (strings only, no ObjectId checks)
    if (!notificationId || !userId) {
      return res.status(400).json({ error: "Missing IDs" });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId, // Ensures the notification belongs to the user
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ 
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const notifications = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ 
      success: true,
      message: "All notifications marked as read",
      count: notifications.nModified,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};