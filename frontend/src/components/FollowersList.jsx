import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Modal,
  Box,
} from '@mui/material';

const FollowersList = ({ userId, open, onClose }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !open) return;

    const fetchFollowers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/follow/${userId}/followers`);
        setFollowers(response.data.followers || []);
      } catch (err) {
        console.error('Error fetching followers:', err);
        setError('Failed to fetch followers.');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId, open]);

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

export default FollowersList;