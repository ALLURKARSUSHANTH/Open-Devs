const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connectionController");

module.exports = (io) => {
  const { sendConnectionRequest, getConnections, acceptConnectionRequest, rejectConnectionRequest } = connectionController(io);

  // Define routes
  router.post("/connect/:id", sendConnectionRequest);
  router.get("/connected/:id", getConnections);

  return router;
};