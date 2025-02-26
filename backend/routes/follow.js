const express = require("express");
const followController = require("../controllers/followController");
const router = express.Router();

router.post("/:id",followController.follow);
router.get("/followers/:userId", followController.getFollowers);
router.get("/following/:userId", followController.getFollowing);


module.exports = router;