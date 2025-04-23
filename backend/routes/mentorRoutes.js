const express = require('express');
const router = express.Router();
const mentoringController = require('../controllers/mentorController');

router.post('/apply/:firebaseUid', mentoringController.applyForMentorship);
router.get('/mentors', mentoringController.getMentors);
router.post('/request-mentorship', mentoringController.becomeMentee);
router.post('/request/reject/:mentorId/:firebaseUid', mentoringController.rejectMentee);
router.post('/submit-rating',mentoringController.submitRating);
router.get('/:firebaseUid',mentoringController.getMentorDetails);
// Get all mentees for a mentor
router.get('/mentees/:mentorId', mentoringController.getMentees);

// Get all mentee requests for a mentor
router.get('/requests/:mentorId', mentoringController.getMenteeRequests);

// Accept mentee request
router.post('/requests/:mentorId/:menteeId/accept', mentoringController.acceptMenteeRequest);

module.exports = router;