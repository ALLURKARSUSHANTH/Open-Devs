import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardHeader, Avatar, Typography, Button, Collapse, Rating , TextField} from '@mui/material';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Mentee = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [expandedMentor, setExpandedMentor] = useState(null); // For handling expanded cards
  const [rating, setRating] = useState(0); // Store rating value
  const [feedback, setFeedback] = useState(''); // Store feedback message
  const [selectedMentor, setSelectedMentor] = useState(null); // Mentor currently being rated

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedInUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      if (!loggedInUserId) return;
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/mentor/mentors', {
          params: { currentUserId: loggedInUserId },
        });
    
        // Ensure that each mentor has an averageRating
        const updatedMentors = response.data.map(mentor => {
          const averageRating = mentor.reviews.length > 0
            ? mentor.reviews.reduce((acc, review) => acc + review.rating, 0) / mentor.reviews.length
            : 0;
          return { ...mentor, averageRating }; // Add averageRating to the mentor object
        });
    
        setMentors(updatedMentors); // Set the updated mentors
      } catch (err) {
        setError('Error fetching mentors');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, [loggedInUserId]);

  const toggleExpand = (mentorId) => {
    setExpandedMentor((prevId) => (prevId === mentorId ? null : mentorId)); // Toggle expand/collapse
  };

  const viewMentor = ()=>{
    alert("will be available soon");
  }

  const requestMentorship = async (mentorId) => {
    try {
      await axios.post('http://localhost:5000/mentor/request-mentorship', {
        mentorId,
        menteeId: loggedInUserId,
      });
      alert('Mentorship request sent!');
    } catch (err) {
      alert('Error requesting mentorship');
    }
  };

  const fetchMentorDetails = async (mentorId) => {
    try {
      const response = await axios.get(`http://localhost:5000/mentor/${mentorId}`);
      return response.data;
    } catch (error) {
      console.error(error);
      setError('Error fetching mentor details');
    }
  };
  const handleRatingChange = (event, newValue) => {
    setRating(newValue); // Update rating
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value); // Update feedback message
  };


  
  const submitRating = async (mentorId) => {
    if (!rating || !feedback) {
      alert("Please provide both a rating and feedback.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/mentor/submit-rating', {
        mentorId,
        rating,
        feedback,
        menteeId: loggedInUserId,
      });
      alert("Rating and feedback submitted successfully!");
      setRating(0);
      setFeedback('');
      setSelectedMentor(null);
    } catch (err) {
      alert("Error submitting rating and feedback");
    }
  };


  return (
    <Grid container spacing={3} justifyContent="center" sx={{ padding: 3 }}>
      {loading && <Typography variant="h6">Loading...</Typography>}
      {error && <Typography variant="h6" color="error">{error}</Typography>}

      {!loading && !error && mentors.length === 0 && (
        <Typography variant="h6">No mentors available at the moment.</Typography>
      )}

      {!loading && !error && mentors.map((mentor) => (
        <Grid item xs={12} sm={6} md={4} key={mentor._id}>
          <Card sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 6 }}>
            <CardHeader
              avatar={<Avatar src={mentor._id?.photoURL || ''} />}
              title={mentor._id?.displayName || 'Unknown Mentor'}
              subheader={mentor._id?.email || 'No email provided'}
              sx={{ paddingBottom: 0 }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Skills</Typography>
              <Typography variant="body2">{mentor._id?.skills?.join(', ') || 'No skills listed'}</Typography>

              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Level</Typography>
              <Typography variant="body2">{mentor._id?.level || 'No level provided'}</Typography>

              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Followers</Typography>
              <Typography variant="body2">{mentor._id?.followers?.length || 'No followers'}</Typography>

              {/* Display Average Rating */}
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Average Rating</Typography>
                <Rating value={mentor.averageRating} readOnly />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  if (mentor.mentees.includes(loggedInUserId)) {
                    viewMentor(mentor._id); // View mentor details if already a mentee
                  } else {
                    requestMentorship(mentor._id); // Request mentorship if not a mentee
                  }
                }}                
                sx={{ marginTop: 2 }}
              >
                {mentor.mentees.includes(loggedInUserId) ? "Your Mentor" : "Request Mentorship"}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => toggleExpand(mentor._id)} // Toggle the expansion of the mentor card
                sx={{ marginTop: 2 }}
              >
                {expandedMentor === mentor._id ? 'Collapse' : 'Expand'}
              </Button>
              <Collapse in={expandedMentor === mentor._id}>
                <Grid container direction="column" spacing={1} sx={{ marginTop: 2 }}>
                  <Grid item>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Give Rating</Typography>
                    <Rating
                      value={rating}
                      onChange={handleRatingChange}
                      precision={0.5}
                      size="large"
                      sx={{ marginBottom: 2 }}
                    />
                    <TextField
                      label="Feedback"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={feedback}
                      onChange={handleFeedbackChange}
                      fullWidth
                      sx={{ marginBottom: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedMentor(mentor._id);
                        submitRating(mentor._id);
                      }}
                      fullWidth
                    >
                      Submit Rating
                    </Button>
                  </Grid>
                </Grid>
              </Collapse>

              <Collapse in={expandedMentor === mentor._id}>
                <Grid container direction="column" spacing={1} sx={{ marginTop: 2 }}>
                  <Grid item>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Reviews</Typography>
                  </Grid>
                  {mentor.reviews.length > 0 ? (
                    mentor.reviews.map((review, index) => (
                      <Grid item key={index} sx={{ marginBottom: 2 }}>
                        <Typography variant="body1"><strong>{review.menteeId.displayName}</strong></Typography>
                        <Rating value={review.rating} readOnly />
                        <Typography variant="body2">{review.feedback}</Typography>
                      </Grid>
                    ))
                  ) : (
                    <Typography variant="body2">No reviews yet.</Typography>
                  )}
                </Grid>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Mentee;
