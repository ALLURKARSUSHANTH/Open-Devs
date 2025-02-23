const express = require('express');
const router = express.Router();
const { getNotifications,acceptConnectionRequest,rejectConnectionRequest} = require('../controllers/notificationController');

router.get('/notifications/:userId', getNotifications);
router.post('/reject-request/:senderId', rejectConnectionRequest);
router.post("/accept-request/:senderId", acceptConnectionRequest);

module.exports = router;