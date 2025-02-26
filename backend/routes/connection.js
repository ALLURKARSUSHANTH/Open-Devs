const express = require("express");
const router = express.Router();
const { sendConnectionRequest, getConnectionsCount , getConnections } = require("../controllers/connectionController");

// Define routes
router.post("/connect/:id", sendConnectionRequest);
router.get("/connections-count/:id", getConnectionsCount);
router.get("/connections/:userId", getConnections);

module.exports = router;