import React from 'react';
import { useState, useEffect } from 'react';
import Mentee from '../components/Mentee';
import Mentor from '../components/Mentor';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Button, Alert, CircularProgress, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Mentoring = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoggedInUserId(user?.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!loggedInUserId) return;
      try {
        const response = await axios.get(`${API_URL}/users/firebase/${loggedInUserId}`);
        setRole(response.data.role);
        setUserData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching role');
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUserId) fetchRole();
  }, [loggedInUserId, applicationStatus]);

  const handleApplyForMentorship = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      const response = await axios.post(
        `${API_URL}/mentor/apply/${loggedInUserId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setApplicationStatus('success');
        setRole('mentor');
      } else {
        throw new Error(response.data.error || 'Application failed');
      }
    } catch (err) {
      console.error('Application error:', err.response?.data || err.message);
      setApplicationStatus('error');
      setError(err.response?.data?.error || 'Application failed');
      setErrorDetails(err.response?.data?.details);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress size={60} />
    </Box>
  );

  return (
    <div style={{ padding: '20px' }}>
      {role !== 'mentor' && (
        <Box display="flex" flexDirection="column" alignItems="flex-end" mb={3}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleApplyForMentorship}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ mb: 1 }}
          >
            {loading ? 'Processing...' : 'Apply to be a Mentor'}
          </Button>
          {userData && (
            <Typography variant="caption" color="textSecondary">
              Current Level: {userData.level || 'beginner'} | Points: {userData.points || 0}
            </Typography>
          )}
        </Box>
      )}
      
      {applicationStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Mentor application submitted successfully!
        </Alert>
      )}
      
      {applicationStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography fontWeight="bold">{error}</Typography>
          {errorDetails && (
            <Box mt={1}>
              {errorDetails.currentLevel && (
                <Typography variant="body2">
                  Current Level: {errorDetails.currentLevel}
                </Typography>
              )}
              {errorDetails.currentPoints && (
                <Typography variant="body2">
                  Current Points: {errorDetails.currentPoints}
                </Typography>
              )}
              {errorDetails.requiredPoints && (
                <Typography variant="body2">
                  Required Points: {errorDetails.requiredPoints}
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      )}
      
      {role === 'mentor' ? <Mentor /> : <Mentee />}
    </div>
  );
};

export default Mentoring;