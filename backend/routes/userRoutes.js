// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/firebase', userController.createOrGetUser); 
router.get('/firebase/:firebaseUid', userController.getUserByFirebaseUid);
router.put('/update/:firebaseUid', userController.updateProfile);
router.get('/search/:query', userController.searchUser);
router.patch('/skills/:firebaseUid', userController.addUserSkills);
router.get('/daily-login/:firebaseUid', userController.dailyLogin);
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;