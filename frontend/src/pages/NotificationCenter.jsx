import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Paper,
  Stack,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import socket from '../context/socket';

const NotificationCenter = ({ loggedInUserId }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      switch (filter) {
        case 'unread':
          return !notification.isRead;
        case 'requests':
          return notification.type === 'connectionRequest' || 
                 notification.type === 'menteeRequest';
        case 'messages':
          return notification.type === 'message';
        case 'follows':
          return notification.type === 'newFollower';
        default: // 'all'
          return true;
      }
    });
  }, [notifications, filter]);

  useEffect(() => {
    if (!loggedInUserId) return;
    fetchNotifications();
  }, [loggedInUserId]);

  const fetchNotifications = async (loadMore = false) => {
    try {
      setLoading(true);
      const params = {
        limit: 10,
        ...(loadMore && lastNotification && { lastId: lastNotification._id })
      };

      const response = await axios.get(`${API}/notifications/all/${loggedInUserId}`, { params });
      const newNotifications = response.data;

      if (loadMore) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      if (newNotifications.length > 0) {
        setLastNotification(newNotifications[newNotifications.length - 1]);
      }
      
      setHasMore(newNotifications.length === parseInt(params.limit));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNotifications = async () => {
    if (!hasMore) return;
    await fetchNotifications(true);
  };
  
  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API}/notifications/markallasread/${loggedInUserId}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleRequest = async (type, senderId) => {
    setProcessing(true);
    try {
      socket.emit(type, { userId: loggedInUserId, senderId });
      setNotifications(prev => prev.filter(n => n.senderId._id !== senderId));
    } catch (error) {
      console.error(`Error ${type} request:`, error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Notification Center
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<DoneAllIcon />}
            onClick={markAllAsRead}
            variant="outlined"
            disabled={notifications.length === 0 || loading}
          >
            Mark All as Read
          </Button>
        </Stack>

        {/* Filter Chips */}
        <Stack direction="row" spacing={1} mb={2}>
          <Chip 
            label="All" 
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
          />
          <Chip 
            label="Unread" 
            onClick={() => setFilter('unread')}
            color={filter === 'unread' ? 'primary' : 'default'}
          />
          <Chip 
            label="Requests" 
            onClick={() => setFilter('requests')}
            color={filter === 'requests' ? 'primary' : 'default'}
          />
          <Chip 
            label="Messages" 
            onClick={() => setFilter('messages')}
            color={filter === 'messages' ? 'primary' : 'default'}
          />
          <Chip 
            label="Follows" 
            onClick={() => setFilter('follows')}
            color={filter === 'follows' ? 'primary' : 'default'}
          />
        </Stack>

        {loading && !filteredNotifications.length ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box textAlign="center" py={4}>
            <NotificationsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No {filter === 'all' ? '' : filter + ' '}notifications
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ width: '100%' }}>
              {filteredNotifications.map((notification) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'action.selected'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={notification.senderId?.photoURL} 
                        alt={notification.senderId?.displayName}
                        sx={{ width: 48, height: 48 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight={notification.isRead ? 'normal' : 'bold'}>
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            display="block"
                          >
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                          <Chip
                            label={notification.type.replace('Request', '')}
                            size="small"
                            sx={{ mt: 0.5, textTransform: 'capitalize' }}
                          />
                        </>
                      }
                    />
                    {(notification.type === 'connectionRequest' || notification.type === 'menteeRequest') && (
                      <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                        <Tooltip title="Accept">
                          <IconButton
                            color="primary"
                            onClick={() => handleRequest(
                              notification.type === 'connectionRequest' ? 'acceptRequest' : 'acceptMentee',
                              notification.senderId._id
                            )}
                            disabled={processing}
                          >
                            {processing ? <CircularProgress size={24} /> : <CheckIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            color="error"
                            onClick={() => handleRequest(
                              notification.type === 'connectionRequest' ? 'rejectRequest' : 'rejectMentee',
                              notification.senderId._id
                            )}
                            disabled={processing}
                          >
                            {processing ? <CircularProgress size={24} /> : <CloseIcon />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            
            {hasMore && filteredNotifications.length > 0 && (
              <Box textAlign="center" mt={2}>
                <Button 
                  onClick={loadMoreNotifications} 
                  variant="outlined"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationCenter;