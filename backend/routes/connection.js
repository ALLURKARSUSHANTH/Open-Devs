const express = require("express");
const router = express.Router();
const { sendConnectionRequest, getConnectionsCount,rejectConnectionRequest,acceptConnectionRequest } = require("../controllers/connectionController");

// Define routes
router.post("/connect/:id", sendConnectionRequest);
router.get("/connections-count/:id", getConnectionsCount);
router.post('/reject-request/:senderId', rejectConnectionRequest);
router.post("/accept-request/:senderId", acceptConnectionRequest);

module.exports = router;