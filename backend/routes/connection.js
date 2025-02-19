const express = require("express");
const router = express.Router();
const { sendConnectionRequest, acceptConnectionRequest, getConnectionsCount } = require("../controllers/connectionController");

// Define routes
router.post("/connect/:id", sendConnectionRequest);
router.post("/accept-request/:id", acceptConnectionRequest);
router.get("/connections-count/:id", getConnectionsCount);

module.exports = router;