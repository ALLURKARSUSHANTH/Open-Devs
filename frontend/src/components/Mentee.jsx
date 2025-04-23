import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  Typography, 
  Button, 
  Collapse, 
  Rating, 
  TextField,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Star, 
  Send,
  People,
  School,
  Email,
  Chat
} from '@mui/icons-material';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import socket from '../context/socket';

const Mentee = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [expandedMentor, setExpandedMentor] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
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
    const fetchMentors = async () => {
      if (!loggedInUserId) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/mentor/mentors`, {
          params: { currentUserId: loggedInUserId },
        });
    
        const updatedMentors = response.data.map(mentor => {
          const averageRating = mentor.reviews.length > 0
            ? mentor.reviews.reduce((acc, review) => acc + review.rating, 0) / mentor.reviews.length
            : 0;
          return { ...mentor, averageRating };
        });
    
        setMentors(updatedMentors);
      } catch (err) {
        setError('Error fetching mentors');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, [loggedInUserId]);

  const toggleExpand = (mentorId) => {
    setExpandedMentor((prevId) => (prevId === mentorId ? null : mentorId));
  };

  const requestMentorship = async (mentorId) => {
    try {
      const response = await axios.post(`${API_URL}/mentor/request-mentorship`, {
        mentorId: mentorId,
        menteeId: loggedInUserId,
      });
  
      if (response.status >= 200 && response.status < 300) {
        alert('Mentorship request sent!');
      } else {
        alert('Request was sent, but the server responded with an unexpected status.');
      }
    } catch (err) {
      alert('Error requesting mentorship');
      console.error(err);
    }
  };

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const submitRating = async (mentorId) => {
    if (!rating || !feedback) {
      alert("Please provide both a rating and feedback.");
      return;
    }

    try {
      await axios.post(`${API_URL}/mentor/submit-rating`, {
        mentorId,
        rating,
        feedback,
        menteeId: loggedInUserId,
      });
      alert("Rating and feedback submitted successfully!");
      setRating(0);
      setFeedback('');
      setSelectedMentor(null);
    } catch (err) {
      alert("Error submitting rating and feedback");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ 
        fontWeight: 'bold', 
        mb: 4, 
        color: 'primary.main',
        textAlign: 'center'
      }}>
        Find Your Mentor
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={60} />
        </Box>
      )}

      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error">{error}</Typography>
        </Paper>
      )}

      {!loading && !error && mentors.length === 0 && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="textSecondary">
            No mentors available at the moment.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Check back later or try refreshing the page.
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {!loading && !error && mentors.map((mentor) => (
          <Grid item xs={12} sm={6} md={4} key={mentor._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 8
              }
            }}>
              <CardHeader
                avatar={
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <School color="primary" fontSize="small" />
                    }
                  >
                    <Avatar 
                      src={mentor._id?.photoURL || ''} 
                      sx={{ 
                        width: 56, 
                        height: 56,
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/profile/${mentor._id?._id}`)}
                    />
                  </Badge>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {mentor._id?.displayName || 'Unknown Mentor'}
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {mentor._id?.email || 'No email provided'}
                  </Typography>
                }
                action={
                  <IconButton onClick={() => toggleExpand(mentor._id)}>
                    {expandedMentor === mentor._id ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                }
                sx={{ 
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Rating 
                    value={mentor.averageRating} 
                    readOnly 
                    precision={0.5}
                    emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({mentor.reviews.length} reviews)
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Skills
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {mentor._id?.skills?.slice(0, 3).map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {mentor._id?.skills?.length > 3 && (
                      <Chip label={`+${mentor._id.skills.length - 3}`} size="small" />
                    )}
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <People color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {mentor._id?.followers?.length || 0} followers
                    </Typography>
                  </Box>
                  <Chip 
                    label={mentor._id?.level || 'No level'} 
                    color="secondary" 
                    size="small" 
                    variant="outlined"
                  />
                </Box>

                <Button
                  variant={mentor.mentees.includes(loggedInUserId) ? "outlined" : "contained"}
                  color="primary"
                  fullWidth
                  startIcon={<Send />}
                  onClick={() => {
                    if (mentor.mentees.includes(loggedInUserId)) {
                      navigate(`/profile/${mentor._id?._id}`);
                    } else {
                      requestMentorship(mentor._id);
                    }
                  }}
                  sx={{ mb: 2 }}
                >
                  {mentor.mentees.includes(loggedInUserId) ? "Your Mentor" : "Request Mentorship"}
                </Button>

                <Button
                  variant="text"
                  color="primary"
                  fullWidth
                  startIcon={<Chat />}
                  onClick={() => navigate(`/chat/${mentor._id?._id}`)}
                >
                  Send Message
                </Button>
              </CardContent>

              <Collapse in={expandedMentor === mentor._id}>
                <Divider />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Rate & Review
                  </Typography>
                  
                  <Box mb={3}>
                    <Rating
                      value={rating}
                      onChange={handleRatingChange}
                      precision={0.5}
                      size="large"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Your feedback"
                      variant="outlined"
                      multiline
                      rows={3}
                      value={feedback}
                      onChange={handleFeedbackChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedMentor(mentor._id);
                        submitRating(mentor._id);
                      }}
                      fullWidth
                    >
                      Submit Review
                    </Button>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Reviews ({mentor.reviews.length})
                  </Typography>
                  
                  {mentor.reviews.length > 0 ? (
                    <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {mentor.reviews.map((review, index) => (
                        <React.Fragment key={index}>
                          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar src={review.menteeId?.photoURL} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={review.menteeId?.displayName || 'Anonymous'}
                              secondary={
                                <>
                                  <Rating value={review.rating} readOnly size="small" />
                                  <Typography variant="body2">
                                    {review.feedback}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {index < mentor.reviews.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No reviews yet. Be the first to review!
                      </Typography>
                    </Paper>
                  )}
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Mentee;