const express = require("express");
const router = express.Router();
const { sendConnectionRequest , getConnections ,removeConnection} = require("../controllers/connectionController");

// Define routes
router.post("/connect/:id", sendConnectionRequest);
router.get("/connections/:userId", getConnections);
router.delete("/remove-connection/:connectionId", removeConnection);

module.exports = router;