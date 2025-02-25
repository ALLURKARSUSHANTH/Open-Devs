import React, { useState, useEffect } from 'react';
import { Button, Menu, MenuItem, ListItemText, Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Notifications = ({ loggedInUserId }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

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
    }
  };

  const handleRejectRequest = async (senderId) => {
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
        sx={{ mt: 5 }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem key={notification._id}>
              <ListItemText primary={`${notification.senderId.displayName} sent you a connection request.`} />
              <Button onClick={() => handleAcceptRequest(notification.senderId._id)}>Accept</Button>
              <Button onClick={() => handleRejectRequest(notification.senderId._id)}>Reject</Button>
            </MenuItem>
          ))
        ) : (
          <MenuItem>No new notifications</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
