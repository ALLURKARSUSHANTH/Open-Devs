const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead} = require('../controllers/notificationController');

router.get('/newNotifications/:userId', getNotifications);
router.patch('/notifications/:userId/:notificationId', markNotificationAsRead);
router.patch('/markallasread/:userId', markAllNotificationsAsRead); // For marking all notifications as read


module.exports = router;