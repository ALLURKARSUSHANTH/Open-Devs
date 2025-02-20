const express = require('express');
const router = express.Router();
const mentoringController = require('../controllers/mentorController');

router.post('/apply/:firebaseUid', mentoringController.applyForMentorship);
router.post('/create/:firebaseUid', mentoringController.createMentor);
router.get('/mentors', mentoringController.getMentors);
router.get('/mentees/:firebaseUid', mentoringController.getMentee);

module.exports = router;