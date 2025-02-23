import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Avatar, Button } from '@mui/material';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Mentee = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [mentorId, setMentorId] = useState(null);

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
        const response = await axios.get('http://localhost:5000/mentor/mentors');
        setMentors(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching mentors');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [loggedInUserId]); 

  const requestMentorship = async (mentorId) => {
    try {
      console.log("Sending mentorship request:", { mentorId, menteeId: loggedInUserId });
  
      const response = await axios.post("http://localhost:5000/mentor/request-mentorship", {
        mentorId,
        menteeId: loggedInUserId,
      });
  
      alert("Mentorship request sent successfully!");
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Failed to send mentorship request:", err.response?.data || err);
      alert(err.response?.data?.error || "Failed to send mentorship request");
    }
  };
  const viewMentor = async (mentorId) => {
    try {
      console.log("Viewing mentor:", { mentorId, menteeId: loggedInUserId });
  
      const response = await axios.get("http://localhost:5000/mentor/mentors", {
        mentorId,
        menteeId: loggedInUserId,
      });
  
      alert("This feature will be available soon!");
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Failed to send mentorship request:", err.response?.data || err);
      alert(err.response?.data?.error || "Failed to send mentorship request");
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Mentors
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && mentors.length === 0 && (
        <Typography>No mentors available at the moment.</Typography>
      )}
      <List>
        {mentors.map((mentor) => (
          <ListItem key={mentor._id} divider>
            <Avatar src={mentor._id?.photoURL || ''} 
            sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', marginRight: 2 }}
            />
            <ListItemText
              primary={mentor._id?.displayName || 'Unknown Mentor'}
              secondary={mentor._id?.email || 'No email provided'}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                if (mentor.mentees.includes(loggedInUserId)) {
                  viewMentor(mentor._id); // View mentor details if already a mentee
                } else {
                  requestMentorship(mentor._id); // Request mentorship if not a mentee
                }
              }}
            >
              {mentor.mentees.includes(loggedInUserId) ? "Your Mentor" : "Request Mentorship"}
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Mentee;
