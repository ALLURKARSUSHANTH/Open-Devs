const express = require("express");
const followController = require("../controllers/followController");
const router = express.Router();

router.post("/:id",followController.follow);
//router.get("/following/:userId", followController.getFollowing);
router.delete("/remove-follower/:followerId", followController.removeFollower);
//router.delete("remove-following/:followingId", followController.removeFollowing);

router.get("/:id/followers-count", followController.getFollowers);

module.exports = router;