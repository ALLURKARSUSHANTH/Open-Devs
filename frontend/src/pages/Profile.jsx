import React from 'react';
import { useSelector } from 'react-redux';
import { Typography, Avatar, Card, CardContent, Grid, Button,Box } from '@mui/material';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.auth.profile);

  const displayName = profile?.displayName || 'User';
  const email = profile?.email || 'No email available';
  const photoURL = profile?.photoURL || 'https://via.placeholder.com/100'; 

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
              <Button onClick={handleLogout}>LogOut</Button>
           
            </Grid>
          </CardContent>
        </Card>
        </Box>
  );
};

export default Profile;
