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
  Modal,
  Box,
} from '@mui/material';
import { logout } from '../firebase/auth';
import {
  People as ConnectionsIcon,
  Favorite as FollowersIcon,
  PhotoLibrary as PostsIcon,
} from '@mui/icons-material';

// FollowersList Component
const FollowersList = ({ followers, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Followers
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : followers.length === 0 ? (
          <Typography>No followers found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {followers.map((follower) => (
              <Grid item key={follower.id} xs={12}>
                <Card sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                  <Avatar src={follower.photoURL} alt={follower.displayName} sx={{ mr: 2 }} />
                  <Typography variant="body1">{follower.displayName}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Modal>
  );
};

// Main Profile Component
const Profile = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.auth.profile);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || 'User');
  const [email, setEmail] = useState(profile?.email || 'No email available');
  const [mobileNumber, setMobileNumber] = useState(profile?.mobileNumber || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || 'https://via.placeholder.com/100');
  const [followers, setFollowers] = useState([]); 
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);

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
        // Fetch followers list
        const followersRes = await axios.get(`http://localhost:5000/follow/followers/${loggedInUserId}`);
        setFollowers(followersRes.data.followers || []);

        // Fetch posts count
        const postsRes = await axios.get(`http://localhost:5000/posts/getposts/${loggedInUserId}`);
        console.log('Posts API Response:', postsRes.data);
        setPosts(postsRes.data.length || []);

        // Fetch connections count
        const connectionsRes = await axios.get(`http://localhost:5000/connections/connections/${loggedInUserId}`);
        setConnections(connectionsRes.data.connections || []);

      } catch (err) {
        console.error('Error fetching counts:', err);
        setError('Failed to fetch data.');
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

  const handleOpenFollowersModal = () => {
    setFollowersModalOpen(true);
  };

  const handleCloseFollowersModal = () => {
    setFollowersModalOpen(false);
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

              {isEditing ? (
                <Grid container direction="column" spacing={2} sx={{ width: '100%', marginTop: 2, paddingLeft: 2 }}>
                  <Grid item>
                    <TextField
                      label="Full Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
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
                          color: '#000000',
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
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

              <Grid container justifyContent="space-around" sx={{ marginTop: 3 }}>
                <Grid item>
                  <Typography variant="h6" align="center">
                    {connections.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ConnectionsIcon sx={{ marginRight: 1, color: '#6a11cb' }} /> Connections
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="h6"
                    align="center"
                    onClick={handleOpenFollowersModal}
                    sx={{ cursor: 'pointer' }}
                  >
                    {followers.length} {/* Use followers.length instead of followersCount */}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={handleOpenFollowersModal}
                  >
                    <FollowersIcon sx={{ marginRight: 1, color: '#ff4081' }} /> Followers
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" align="center">
                    {posts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PostsIcon sx={{ marginRight: 1, color: '#4caf50' }} /> Posts
                  </Typography>
                </Grid>
              </Grid>

              <FollowersList
                followers={followers} // Pass followers array as a prop
                open={followersModalOpen}
                onClose={handleCloseFollowersModal}
              />

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