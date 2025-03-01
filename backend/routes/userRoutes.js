const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/firebase', userController.createOrGetUser); 
router.get('/firebase/:firebaseUid', userController.getUserByFirebaseUid);
router.put('/update/:firebaseUid', userController.updateProfile);
router.get('/search/:query', userController.searchUser);


module.exports = router;
