const express = require("express");
const followController = require("../controllers/followController");
const router = express.Router();

router.post("/:id",followController.follow);
router.get("/:id/followers-count", followController.getFollowersCount);

module.exports = router;