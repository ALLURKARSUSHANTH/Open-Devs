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

const Notifications = ({ loggedInUserId }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [processing, setProcessing] = useState(false); // To manage loading state

  // Fetch notifications for the current user
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/notifications/notifications/${loggedInUserId}`);
      const data = await response.json();
      setNotifications(data);
      setNotificationCount(data.length); // Update notification count
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (loggedInUserId) {
      fetchNotifications();
    }
  }, [loggedInUserId]);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Fetch notifications when the bell is clicked
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleAcceptRequest = async (senderId) => {
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/notifications/accept-request/${senderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      if (response.ok) {
        fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (senderId) => {
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/notifications/reject-request/${senderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      if (response.ok) {
        fetchNotifications(); // Refresh notifications
      }
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
              <Avatar src={notification.senderId.profilePicture} alt={notification.senderId.displayName} />
              <ListItemText primary={`${notification.senderId.displayName} sent you a connection request.`} />
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