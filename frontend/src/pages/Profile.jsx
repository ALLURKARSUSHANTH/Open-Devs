import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import {
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import { logout } from '../firebase/auth';
import {
  People as ConnectionsIcon,
  Favorite as FollowersIcon,
  PhotoLibrary as PostsIcon,
} from '@mui/icons-material';

const Profile = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.auth.profile);
  const [followersCount, setFollowersCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // State for editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || 'User');
  const [email, setEmail] = useState(profile?.email || 'No email available');
  const [mobileNumber, setMobileNumber] = useState(profile?.mobileNumber || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL);
  

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
    const fetchCounts = async () => {
      if (!loggedInUserId) return;

      try {
        console.log('Fetching followers count...');
        const followersRes = await axios.get(`http://localhost:5000/follow/${loggedInUserId}/followers-count `);
        console.log('Followers API Response:', followersRes.data);

        console.log('Fetching posts count...');
        const postsRes = await axios.get(`http://localhost:5000/posts/getPostsCount/${loggedInUserId}`);
        console.log('Posts API Response:', postsRes.data);

        console.log('Fetching connections count...');
        const connectionsRes = await axios.get(`http://localhost:5000/connections/connections-count/${loggedInUserId}`);
        console.log('Connections API Response:', connectionsRes.data);


        setFollowersCount(followersRes.data.followersCount || 0);
        setPostsCount(postsRes.data.postsCount || 0);
        setConnectionsCount(connectionsRes.data.connectionsCount || 0);
        
      } catch (err) {
        console.error('Error fetching counts:', err);
        if (err.response) {
          setError(`Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
        } else if (err.request) {
          setError('Network error: Could not connect to the server.');
        } else {
          setError('Error: Could not send request.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [loggedInUserId]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleSave = () => {
    console.log('Updated Details:', { displayName, email, mobileNumber, photoURL });
    setIsEditing(false);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
      };
      reader.readAsDataURL(file); 
    }
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: 'center', marginTop: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8} md={6}>
        <Card sx={{ borderRadius: 4, boxShadow: 6}}>
          <div
            style={{
              height: '150px',
              background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
            }}
          />

          <CardContent>
            <Grid container direction="column" alignItems="center" spacing={2}>
              <Avatar
                src={photoURL}
                alt={displayName}
                sx={{
                  width: 120,
                  height: 120,
                  marginTop: '-60px',
                  border: '4px solid white',
                  boxShadow: 3,
                }}
              />

              {/* Editable Fields */}
              {isEditing ? (
                <Grid container direction="column" spacing={2} sx={{ width: '100%', marginTop: 2, paddingLeft: 2 }}>
                  {/* Full Name Field */}
                  <Grid item>
                    <TextField
                      label="Full Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>

                  {/* Email Field */}
                  <Grid item>
                    <TextField
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      margin="normal"
                      disabled
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          color: '#000000', // Black color for disabled email text
                          WebkitTextFillColor: '#000000', // For Safari
                        },
                      }}
                    />
                  </Grid>

                  {/* Mobile Number Field */}
                  <Grid item>
                    <TextField
                      label="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>

                  {/* Avatar, Username, and Change Photo Button */}
                  <Grid item>
                    <Card sx={{ borderRadius: 4, boxShadow: 6, background: 'lightgray' }}>
                      <CardContent>
                        <Grid container alignItems="center" spacing={2} justifyContent="space-between">
                          {/* Avatar and Username */}
                          <Grid item>
                            <Grid container alignItems="center" spacing={2}>
                              <Grid item>
                                <Avatar
                                  src={photoURL}
                                  alt={displayName}
                                  sx={{ width: 60, height: 60, border: '2px solid black' }}
                                />
                              </Grid>
                              <Grid item>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {displayName}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>

                          {/* Change Photo Button */}
                          <Grid item>
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id="avatar-upload"
                              type="file"
                              onChange={handlePhotoUpload}
                            />
                            <label htmlFor="avatar-upload">
                              <Button
                                variant="contained"
                                component="span"
                                sx={{
                                  backgroundColor: '#007bff',
                                  color: 'white',
                                  textTransform: 'none',
                                  borderRadius: '20px',
                                  padding: '4px 12px',
                                  fontSize: '12px',
                                }}
                              >
                                Change photo
                              </Button>
                            </label>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <>
                  <Typography variant="h4" component="div" sx={{ marginTop: 2, fontWeight: 'bold' }}>
                    {displayName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {email}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {mobileNumber || 'No mobile number available'}
                  </Typography>
                </>
              )}

              {/* Social Metrics */}
              <Grid container justifyContent="space-around" sx={{ marginTop: 3 }}>
                <Grid item>
                  <Typography variant="h6" align="center">
                    {connectionsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ConnectionsIcon sx={{ marginRight: 1, color: '#6a11cb' }} /> Connections
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" align="center">
                    {followersCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <FollowersIcon sx={{ marginRight: 1, color: '#ff4081' }} /> Followers
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" align="center">
                    {postsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PostsIcon sx={{ marginRight: 1, color: '#4caf50' }} /> Posts
                  </Typography>
                </Grid>
              </Grid>

              {/* Edit/Save and Logout Buttons */}
              <Grid container justifyContent="center" spacing={2} sx={{ marginTop: 3 }}>
                <Grid item>
                  {isEditing ? (
                    <Button onClick={handleSave} color="primary" variant="contained" sx={{ borderRadius: 20 }}>
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} color="primary" variant="outlined" sx={{ borderRadius: 20 }}>
                      Edit Profile
                    </Button>
                  )}
                </Grid>
                <Grid item>
                  <Button onClick={handleLogout} color="secondary" variant="contained" sx={{ borderRadius: 20 }}>
                    LogOut
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
export default Profile;