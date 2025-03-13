const express = require("express");
const followController = require("../controllers/followController");
const router = express.Router();

router.post("/:id",followController.follow);
router.delete("/remove-follower/:followerId", followController.removeFollower);
router.get("/:id/followers-count", followController.getFollowers);

module.exports = router;