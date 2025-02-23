const express = require("express");
const router = express.Router();
const { sendConnectionRequest, getConnectionsCount } = require("../controllers/connectionController");

// Define routes
router.post("/connect/:id", sendConnectionRequest);
router.get("/connections-count/:id", getConnectionsCount);

module.exports = router;