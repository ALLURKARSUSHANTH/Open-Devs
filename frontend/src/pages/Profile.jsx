import React from 'react';
import { useSelector } from 'react-redux';
import { Typography, Avatar, Card, CardContent, Grid, Button } from '@mui/material';
import { logout } from '../firebase/auth';

const Profile = () => {
  
  const profile = useSelector((state) => state.auth.profile);

  const displayName = profile.displayName || 'User';
  const email = profile.email || 'No email available';
  const photoURL = profile.photoURL || 'https://via.placeholder.com/100'; 
  const handleLogout = async () => {
        try {
          await logout();
          navigate('/signin');
        } catch (error) {
          console.error('Logout failed', error);
        }
      };

  return (
    <Grid container justifyContent="center" alignItems="center" spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
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
      </Grid>
    </Grid>
  );
};

export default Profile;
