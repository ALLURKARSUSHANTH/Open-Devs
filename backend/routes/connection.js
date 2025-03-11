const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connectionController");

module.exports = (io) => {
  const { sendConnectionRequest, getConnections ,removeConnection } = connectionController(io);

  // Define routes
  router.post("/connect/:id", sendConnectionRequest);
  router.get("/connected/:id", getConnections);
  router.delete("/remove-connection/:connectionId", removeConnection);
  

  return router;
};