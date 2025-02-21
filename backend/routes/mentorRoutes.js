const express = require('express');
const router = express.Router();
const mentoringController = require('../controllers/mentorController');

router.post('/apply/:firebaseUid', mentoringController.applyForMentorship);
router.post('/create/:firebaseUid', mentoringController.createMentor);
router.get('/mentors', mentoringController.getMentors);
router.get('/mentees/:firebaseUid', mentoringController.getMentee);
router.post('/request-mentorship', mentoringController.becomeMentee);
router.post('/accept/:menteeId/:firebaseUid', mentoringController.acceptMentee);
router.post('/reject/:mentorId/:firebaseUid', mentoringController.rejectMentee);

module.exports = router;