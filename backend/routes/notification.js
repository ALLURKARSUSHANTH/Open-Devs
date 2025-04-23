const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getAllNotifications} = require('../controllers/notificationController');

router.get('/newNotifications/:userId', getNotifications);
router.get('/all/:userId', getAllNotifications);
router.patch('/notifications/:userId/:notificationId', markNotificationAsRead);
router.patch('/markallasread/:userId', markAllNotificationsAsRead); // For marking all notifications as read


module.exports = router;