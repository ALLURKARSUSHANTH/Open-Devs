import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  Box, 
  Grid, 
  CircularProgress,
  IconButton,
  Collapse,
  Divider,
  Chip,
  Button,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const Mentor = () => {
  const [menteeData, setMenteeData] = useState([]);
  const [menteeRequests, setMenteeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [notificationOpen, setNotificationOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedInUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!loggedInUserId) return;

      try {
        setLoading(true);
        setRequestsLoading(true);
        
        // Fetch current mentees
        const menteesResponse = await fetch(`${API_URL}/mentor/mentees/${loggedInUserId}`);
        if (!menteesResponse.ok) throw new Error("Failed to fetch mentees");
        const menteesData = await menteesResponse.json();
        setMenteeData(menteesData);

        // Fetch mentee requests
        const requestsResponse = await fetch(`${API_URL}/mentor/requests/${loggedInUserId}`);
        if (!requestsResponse.ok) throw new Error("Failed to fetch mentee requests");
        const requestsData = await requestsResponse.json();
        setMenteeRequests(requestsData);
        console.log(requestsData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setRequestsLoading(false);
      }
    };

    fetchData();
  }, [loggedInUserId, API_URL]);

  const toggleExpand = (menteeId) => {
    setExpandedCards(prev => ({
      ...prev,
      [menteeId]: !prev[menteeId]
    }));
  };

  const handleAcceptRequest = async (requestId, menteeId) => {
    // Optimistically update the UI
    const requestToAccept = menteeRequests.find(r => r._id === requestId);
    const updatedRequests = menteeRequests.filter(r => r._id !== requestId);
    setMenteeRequests(updatedRequests);
    
    if (requestToAccept?.mentee) {
      setMenteeData(prev => [...prev, requestToAccept.mentee]);
    }
  
    try {
      await axios.post(`${API_URL}/mentor/requests/${loggedInUserId}/${menteeId}/accept`);
    } catch (error) {
      // Revert if the request fails
      setMenteeRequests(prev => [...prev, requestToAccept]);
      setMenteeData(prev => prev.filter(m => m._id !== menteeId));
      throw error;
    }
  };

  const unreadCount = menteeRequests.filter(req => !req.read).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Mentor Dashboard
        </Typography>
        
        <IconButton 
          color="inherit" 
          onClick={() => setNotificationOpen(!notificationOpen)}
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Box>

      {/* Notification Panel */}
      <Collapse in={notificationOpen}>
        <Paper elevation={3} sx={{ mb: 4, maxHeight: '400px', overflow: 'auto' }}>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Mentorship Requests ({menteeRequests.length})
            </Typography>
            
            {requestsLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : menteeRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No pending requests
              </Typography>
            ) : (
              <List>
                {menteeRequests.map((request) => {
                  const mentee = request.mentee || {};
                  const displayName = mentee.displayName || 'New Mentee';
                  const photoURL = mentee.photoURL || '';
                  const initial = displayName[0] || 'M';
                  
                  return (
                    <ListItem
                      key={request._id}
                      sx={{
                        bgcolor: request.read ? 'action.hover' : 'background.paper',
                        transition: 'background-color 0.3s ease',
                        mb: 1,
                        borderRadius: 1
                      }}
                      secondaryAction={
                        <Box>
                          <Tooltip title="Accept Request" arrow>
                          <IconButton onClick={() => handleAcceptRequest(request._id, mentee._id)}>
                            <CheckCircleIcon color={request.read ? 'disabled' : 'primary'} />
                          </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Request" arrow>
                          <IconButton onClick={() => handleRejectRequest(request._id, mentee._id)}>
                            <CancelIcon color={request.read ? 'disabled' : 'error'} />
                          </IconButton> 
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={photoURL}>
                          {initial}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={displayName}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {request.message || 'Wants to connect with you'}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Unknown date'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Paper>
      </Collapse>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={60} />
        </Box>
      ) : menteeData.length === 0 ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="300px"
          sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 4 }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No mentees currently assigned
          </Typography>
          <Typography variant="body1" color="textSecondary">
            When mentees request your guidance, they'll appear here.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {menteeData.map((mentee) => {
            const menteePhotoURL = mentee.photoURL || '';
            const displayName = mentee.displayName || 'Mentee';
            const initial = displayName[0] || 'M';
            
            return (
              <Grid item xs={12} sm={6} md={4} key={mentee._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardHeader
                    avatar={
                      <Avatar 
                        src={menteePhotoURL} 
                        sx={{ 
                          width: 56, 
                          height: 56,
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/profile/${mentee._id}`)}
                      >
                        {initial}
                      </Avatar>
                    }
                    action={
                      <IconButton 
                        onClick={() => toggleExpand(mentee._id)}
                        aria-label="show more"
                      >
                        {expandedCards[mentee._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    }
                    title={
                      <Typography variant="h6" component="div">
                        {displayName}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" color="text.secondary">
                        {mentee.level || 'Beginner'}
                      </Typography>
                    }
                    sx={{ pb: 0 }}
                  />

                  <CardContent sx={{ pt: 1 }}>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                      {mentee.skills?.slice(0, 3).map((skill, index) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {mentee.skills?.length > 3 && (
                        <Chip label={`+${mentee.skills.length - 3}`} size="small" />
                      )}
                    </Box>
                  </CardContent>

                  <Collapse in={expandedCards[mentee._id]} timeout="auto" unmountOnExit>
                    <Divider />
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Contact Information
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Email: {mentee.email || 'Not provided'}
                      </Typography>
                      {mentee.bio && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            About
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {mentee.bio}
                          </Typography>
                        </>
                      )}
                      
                      <Box mt={2} display="flex" justifyContent="space-between">
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/chat/${mentee._id}`)}
                        >
                          Message
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => navigate(`/profile/${mentee._id}`)}
                        >
                          View Profile
                        </Button>
                      </Box>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default Mentor;