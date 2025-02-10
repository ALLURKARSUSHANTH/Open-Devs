import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Avatar, Card, CardContent, Grid, Button, Box } from '@mui/material';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Profile = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.auth.profile);
  const [followersCount, setFollowersCount] = useState(0);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName = profile?.displayName || 'User';
  const email = profile?.email || 'No email available';
  const photoURL = profile?.photoURL || 'https://via.placeholder.com/100'; 

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedInUserId(user.uid);
      } else {
        setLoggedInUserId(null);
      }
    });

    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
    const fetchFollowerCount = async () => {
      if (!loggedInUserId) return; 

      try {
        const response = await axios.get(`http://localhost:5000/follow/${loggedInUserId}/followers-count`);
        setFollowersCount(response.data.followersCount);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching followers count");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowerCount();
  }, [loggedInUserId]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '20px' }}>
      <Card sx={{ maxWidth: 345 }}>
        <CardContent>
          <Grid container direction="column" alignItems="center">
            <Avatar 
              src={photoURL} 
              alt={displayName} 
              sx={{ width: 120, height: 120, marginBottom: 2 }} 
            />
            <Typography variant="h5" component="div" sx={{ marginBottom: 1 }}>
              {displayName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {email}
            </Typography>
            {loading ? (
              <Typography variant="body1" color="text.secondary">Loading followers...</Typography>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Followers: {followersCount}
              </Typography>
            )}
            <Button onClick={handleLogout}>Log Out</Button>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
