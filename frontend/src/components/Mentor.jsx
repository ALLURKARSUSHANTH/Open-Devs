import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Typography, List, ListItem, ListItemText, Box, Avatar } from '@mui/material';

const Mentor = () => {
  const [menteeData, setMenteeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedInUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMentees = async () => {
      if (!loggedInUserId) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/mentor/mentees/${loggedInUserId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch mentees");
        }
        const data = await response.json();
        setMenteeData(data);
      } catch (error) {
        console.error("Error fetching mentees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentees();
  }, [loggedInUserId]);

  return (
    <div>
      <Typography variant="h6">Mentor Dashboard</Typography>

      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : menteeData.length === 0 ? (
          <Typography>No mentees available</Typography>
        ) : (
          <List>
            {menteeData.map((mentee) => (
              <ListItem key={mentee._id}>
                <Avatar 
                  src={mentee.photoURL || ""} 
                  sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', marginRight: 2 }}
                >
                  {mentee.displayName ? mentee.displayName[0] : "M"}
                </Avatar>
                <ListItemText
                  primary={mentee.displayName}
                  secondary={`Email: ${mentee.email}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </div>
  );
};

export default Mentor;
