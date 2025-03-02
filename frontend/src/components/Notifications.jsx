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
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check'; // Tick mark
import CloseIcon from '@mui/icons-material/Close'; // Cross mark
import socket from '../context/socket'; // Import the socket instance

const Notifications = ({ loggedInUserId }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [processing, setProcessing] = useState(false); // To manage loading state

  useEffect(() => {
    if (loggedInUserId) {
      console.log('Joining room:', loggedInUserId);
      socket.emit('joinRoom', loggedInUserId);

      socket.on('newNotification', (notification) => {
        console.log('New notification received:', notification);
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
        setNotificationCount((prevCount) => prevCount + 1);
      });

      // Cleanup on unmount
      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('newNotification');
      };
    }
  }, [loggedInUserId]);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleAcceptRequest = async (senderId) => {
    setProcessing(true);
    try {
      console.log('Accepting request from:', senderId);
      socket.emit('acceptRequest', { userId: loggedInUserId, senderId });

      // Remove the notification from the list
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.senderId._id !== senderId)
      );
      setNotificationCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (senderId) => {
    setProcessing(true);
    try {
      console.log('Rejecting request from:', senderId);
      socket.emit('rejectRequest', { userId: loggedInUserId, senderId });

      // Remove the notification from the list
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.senderId._id !== senderId)
      );
      setNotificationCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <IconButton color="inherit" onClick={handleNotificationClick}>
        <Badge badgeContent={notificationCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notification Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleNotificationClose}
        TransitionComponent={Fade} // Add fade animation
        sx={{ mt: 5 }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem key={notification._id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={notification.senderId.photoURL} alt={notification.senderId.displayName} />
              <ListItemText primary={notification.message} />
              {notification.type === 'connectionRequest' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Accept">
                    <IconButton
                      color="primary"
                      onClick={() => handleAcceptRequest(notification.senderId._id)}
                      disabled={processing}
                    >
                      {processing ? <CircularProgress size={24} /> : <CheckIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      color="error"
                      onClick={() => handleRejectRequest(notification.senderId._id)}
                      disabled={processing}
                    >
                      {processing ? <CircularProgress size={24} /> : <CloseIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </MenuItem>
          ))
        ) : (
          <MenuItem>No new notifications</MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleNotificationClose} sx={{ justifyContent: 'center' }}>
          Close
        </MenuItem>
      </Menu>
    </>
  );
};

export default Notifications;