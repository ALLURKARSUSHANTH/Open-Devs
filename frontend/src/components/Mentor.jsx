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
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
        if (!requestsResponse.ok) throw new Error("Failed to fetch requests");
        const requestsData = await requestsResponse.json();
        setMenteeRequests(requestsData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setRequestsLoading(false);
      }
    };

    fetchData();
  }, [loggedInUserId]);

  const toggleExpand = (menteeId) => {
    setExpandedCards(prev => ({
      ...prev,
      [menteeId]: !prev[menteeId]
    }));
  };

  const handleMarkAsRead = async (requestId) => {
    try {
      const response = await fetch(`${API_URL}/mentor/requests/${requestId}/read`, {
        method: 'PATCH'
      });
      
      if (!response.ok) throw new Error("Failed to mark as read");
      
      setMenteeRequests(prev => 
        prev.map(request => 
          request._id === requestId ? { ...request, read: true } : request
        )
      );
    } catch (error) {
      console.error("Error marking request as read:", error);
    }
  };

  const handleAcceptRequest = async (requestId, menteeId) => {
    try {
      const response = await fetch(`${API_URL}/mentor/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menteeId })
      });
      
      if (!response.ok) throw new Error("Failed to accept request");
      
      // Update both requests and mentees lists
      const updatedRequests = menteeRequests.filter(request => request._id !== requestId);
      setMenteeRequests(updatedRequests);
      
      const newMentee = menteeRequests.find(request => request._id === requestId)?.mentee;
      if (newMentee) {
        setMenteeData(prev => [...prev, newMentee]);
      }
      
    } catch (error) {
      console.error("Error accepting request:", error);
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
                {menteeRequests.map((request) => (
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
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => handleAcceptRequest(request._id, request.mentee._id)}
                          sx={{ mr: 1 }}
                        >
                          Accept
                        </Button>
                        <IconButton onClick={() => handleMarkAsRead(request._id)}>
                          <CheckCircleIcon color={request.read ? 'disabled' : 'primary'} />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={request.mentee.photoURL || ''}>
                        {request.mentee.displayName?.[0] || 'M'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={request.mentee.displayName || 'New Mentee'}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {request.message || 'Wants to connect with you'}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(request.timeStamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
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
          {menteeData.map((mentee) => (
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
                      src={mentee.photoURL || ""} 
                      sx={{ 
                        width: 56, 
                        height: 56,
                        bgcolor: 'primary.main', 
                        color: 'primary.contrastText',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/profile/${mentee._id}`)}
                    >
                      {mentee.displayName ? mentee.displayName[0] : "M"}
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
                      {mentee.displayName || 'Mentee'}
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
                        onClick={() =>{ 
                          const uid = mentee._id;
                          navigate(`/chat/${uid}`);
                        }}
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
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Mentor;