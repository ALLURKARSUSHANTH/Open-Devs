import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Typography, Card, CardContent, CardHeader, Avatar, Box, Grid, CircularProgress } from '@mui/material';

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
      <Typography variant="h5" gutterBottom>Mentor Dashboard</Typography>

      <Box sx={{ flexGrow: 1 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : menteeData.length === 0 ? (
          <Typography>No mentees available</Typography>
        ) : (
          <Grid container spacing={3}>
            {menteeData.map((mentee) => (
              <Grid item xs={12} sm={6} md={4} key={mentee._id}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    avatar={
                      <Avatar 
                        src={mentee.photoURL || ""} 
                        sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
                      >
                        {mentee.displayName ? mentee.displayName[0] : "M"}
                      </Avatar>
                    }
                    title={mentee.displayName}
                    subheader={`Email: ${mentee.email}`}
                  />
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">
                      {/* You can add more details here about the mentee */}
                      Mentee ID: {mentee._id}
                    </Typography>
                    {/* Add more content like mentorship progress or status here */}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </div>
  );
};

export default Mentor;
