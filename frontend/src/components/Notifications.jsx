import React, { useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemText,
  Badge,
  IconButton,
  Avatar,
  Tooltip,
  Box,
  CircularProgress,
  Divider,
  Fade,
  Typography,
  Stack,
  Chip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import socket from '../context/socket';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Notifications = ({ loggedInUserId }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const API = import.meta.env.VITE_API_URL;4
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUserId) return;

    console.log('Joining room:', loggedInUserId);
    socket.emit('joinRoom', loggedInUserId);

    const handleNewNotification = (notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      setNotificationCount(prev => prev + 1);
    };

    socket.on('newNotification', handleNewNotification);
    socket.on('mentorshipRequest', handleNewNotification);

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API}/notifications/newNotifications/${loggedInUserId}`);
        const receivedNotifications = Array.isArray(response.data) 
          ? response.data 
          : response.data?.notifications || [];
        
        setNotifications(receivedNotifications);
        setNotificationCount(receivedNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('mentorshipRequest', handleNewNotification);
    };
  }, [loggedInUserId, API]);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API}/notifications/markallasread/${loggedInUserId}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleRequest = async (type, senderId) => {
    setProcessing(true);
    try {
      socket.emit(type, { userId: loggedInUserId, senderId });
      setNotifications(prev => prev.filter(n => n.senderId._id !== senderId));
      setNotificationCount(prev => prev - 1);
    } catch (error) {
      console.error(`Error ${type} request:`, error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleNotificationClick}
        sx={{
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge 
          badgeContent={notificationCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              right: 5,
              top: 5,
              padding: '0 4px',
              height: '16px',
              minWidth: '16px'
            }
          }}
        >
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
      </IconButton>

<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleNotificationClose}
  TransitionComponent={Fade}
  sx={{ 
    mt: 5,
    '& .MuiPaper-root': {
      width: 400,
      maxHeight: 500,
      borderRadius: 2,
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
    }
  }}
>
  <Box sx={{ p: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h6" fontWeight="bold">
        Notifications
      </Typography>
      <Stack direction="row" spacing={1}>
        {notificationCount > 0 && (
          <Button
            startIcon={<DoneAllIcon />}
            onClick={markAllAsRead}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Mark all
          </Button>
        )}
        <Button
          onClick={() => {
            navigate('/notifications');
            handleNotificationClose();
          }}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          View All
        </Button>
      </Stack>
    </Stack>
  </Box>

        <Divider />

        <Box sx={{ overflow: 'auto' }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem 
                key={notification._id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  py: 1.5,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <Avatar 
                  src={notification.senderId?.photoURL} 
                  alt={notification.senderId?.displayName}
                  sx={{ width: 40, height: 40 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <ListItemText 
                    primary={notification.message}
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondary={new Date(notification.createdAt).toLocaleString()}
                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                  {notification.type && (
                    <Chip 
                      label={notification.type.replace('Request', '')}
                      size="small"
                      sx={{ 
                        mt: 0.5,
                        textTransform: 'capitalize',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  )}
                </Box>
                
                {(notification.type === 'connectionRequest' || notification.type === 'mentorshipRequest') && (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Accept">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleRequest(
                          notification.type === 'connectionRequest' ? 'acceptRequest' : 'acceptMentee',
                          notification.senderId._id
                        )}
                        disabled={processing}
                        sx={{
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.15)'
                          }
                        }}
                      >
                        {processing ? <CircularProgress size={18} /> : <CheckIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRequest(
                          notification.type === 'connectionRequest' ? 'rejectRequest' : 'rejectMentee',
                          notification.senderId._id
                        )}
                        disabled={processing}
                        sx={{
                          backgroundColor: 'rgba(211, 47, 47, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.15)'
                          }
                        }}
                      >
                        {processing ? <CircularProgress size={18} /> : <CloseIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </MenuItem>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button 
            onClick={handleNotificationClose}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default Notifications;