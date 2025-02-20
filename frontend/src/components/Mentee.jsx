import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Avatar } from '@mui/material';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
//still working

const Mentee = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoggedInUserId(user?.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/mentor/mentors');
        setMentors(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching mentors');
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUserId) fetchMentors();
  }, [loggedInUserId]);

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
            <Avatar src={mentor
              .userId
              .profilePicture} />
            <ListItemText
              primary={mentor.userId.displayName}
              secondary={mentor.userId.email}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Mentee;
