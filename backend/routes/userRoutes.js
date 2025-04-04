// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/firebase', userController.createOrGetUser); 
router.get('/firebase/:firebaseUid', userController.getUserByFirebaseUid);
router.put('/update/:firebaseUid', userController.updateProfile);
router.get('/search/:query', userController.searchUser);
router.patch('/skills/:firebaseUid', userController.addUserSkills);
//router.delete('/skills/:firebaseUid', userController.removeUserSkill);

module.exports = router;