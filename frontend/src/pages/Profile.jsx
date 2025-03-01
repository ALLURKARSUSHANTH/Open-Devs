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
  const [counts, setCounts] = useState({
    followers: 0,
    posts: 0,
    connections: 0,
  });
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: profile?.displayName || 'User',
    email: profile?.email || 'No email available',
    mobileNumber: profile?.mobileNumber || '',
    photoURL: profile?.photoURL || '',
  });

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
        const [followersRes, postsRes, connectionsRes] = await Promise.all([
          axios.get(`http://localhost:5000/follow/${loggedInUserId}/followers-count`),
          axios.get(`http://localhost:5000/posts/getMyPosts/${loggedInUserId}`),
          axios.get(`http://localhost:5000/connections/connected/${loggedInUserId}`),
        ]);

        setCounts({
          followers: followersRes.data.followersCount.length || 0,
          posts: postsRes.data.count || 0,
          connections: connectionsRes.data.count || 0,
        });
      } catch (err) {
        console.error('Error fetching counts:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching data.');
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

  const handleSave = async () => {
    try {
      // Update profile data on the server
      await axios.put(`http://localhost:5000/user/${loggedInUserId}`, profileData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'An error occurred while updating profile.');
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, photoURL: reader.result }));
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
        <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
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
                src={profileData.photoURL}
                alt={profileData.displayName}
                sx={{
                  width: 120,
                  height: 120,
                  marginTop: '-60px',
                  border: '4px solid white',
                  boxShadow: 3,
                }}
              />

              {isEditing ? (
                <Grid container direction="column" spacing={2} sx={{ width: '100%', marginTop: 2, paddingLeft: 2 }}>
                  <Grid item>
                    <TextField
                      label="Full Name"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, displayName: e.target.value }))}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>

                  <Grid item>
                    <TextField
                      label="Email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      fullWidth
                      margin="normal"
                      disabled
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          color: '#000000',
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item>
                    <TextField
                      label="Mobile Number"
                      value={profileData.mobileNumber}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>

                  <Grid item>
                    <Card sx={{ borderRadius: 4, boxShadow: 6, background: 'lightgray' }}>
                      <CardContent>
                        <Grid container alignItems="center" spacing={2} justifyContent="space-between">
                          <Grid item>
                            <Grid container alignItems="center" spacing={2}>
                              <Grid item>
                                <Avatar
                                  src={profileData.photoURL}
                                  alt={profileData.displayName}
                                  sx={{ width: 60, height: 60, border: '2px solid black' }}
                                />
                              </Grid>
                              <Grid item>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {profileData.displayName}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>

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
                    {profileData.displayName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {profileData.email}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {profileData.mobileNumber || 'No mobile number available'}
                  </Typography>
                </>
              )}

              <Grid container justifyContent="space-around" sx={{ marginTop: 3 }}>
                <Grid item>
                  <Typography variant="h6" align="center">
                    {counts.connections}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ConnectionsIcon sx={{ marginRight: 1, color: '#6a11cb' }} /> Connections
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" align="center">
                    {counts.followers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <FollowersIcon sx={{ marginRight: 1, color: '#ff4081' }} /> Followers
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" align="center">
                    {counts.posts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PostsIcon sx={{ marginRight: 1, color: '#4caf50' }} /> Posts
                  </Typography>
                </Grid>
              </Grid>

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