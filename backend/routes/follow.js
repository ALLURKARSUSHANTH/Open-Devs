const express = require("express");
const followController = require("../controllers/followController");
const router = express.Router();

router.post("/:id",followController.follow);

module.exports = router;