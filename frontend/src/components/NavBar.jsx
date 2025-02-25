import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  TextField,
  Toolbar,
  Badge,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  Fade,
  Divider,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check'; // Tick mark
import CloseIcon from '@mui/icons-material/Close'; // Cross mark
import { useTheme } from '../Theme/toggleTheme';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Brightness4TwoTone, Brightness7 } from '@mui/icons-material';

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [error, setError] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For notification dropdown
  const [processing, setProcessing] = useState(false); // To show loading state

  // Fetch repositories from GitHub API
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoggedInUserId(user?.uid);
    });

    return () => unsubscribe();
  }, []);

  const fetchRepos = async (query) => {
    if (query === '') return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${query}`);
      const data = await response.json();

      if (data.items) {
        setRepos(data.items);
      } else {
        setRepos([]);
      }
    } catch (err) {
      setError('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

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

  // Handle accept connection request
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

  // Handle reject connection request
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle notification bell click
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Fetch notifications when the bell is clicked
  };

  // Close notification dropdown
  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  // Fetch notifications on component mount
  useEffect(() => {
    if (loggedInUserId) {
      fetchNotifications();
    }
  }, [loggedInUserId]);

  // Fetch repositories when search term changes
  useEffect(() => {
    if (searchTerm) {
      fetchRepos(searchTerm);
    } else {
      setRepos([]);
    }
  }, [searchTerm]);

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'Profile', to: '/profile' },
    { name: 'Post', to: '/post' },
    { name: 'Mentoring', to: '/mentoring' },
  ];

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h2" sx={{ flexGrow: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            <Link to="/" style={{ fontWeight: 'bold', color: 'white' }}>
              Open-Devs
            </Link>
          </Typography>

          <TextField
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ borderRadius: '5px' }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
            <IconButton onClick={toggleTheme} color="inherit">
              {theme === 'dark' ? <Brightness7 /> : <Brightness4TwoTone />}
            </IconButton>

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
          </Box>

          {/* Navigation links */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navLinks.map((link) => (
              <Button key={link.name} color="inherit" component={Link} to={link.to} sx={{ marginLeft: 2 }}>
                {link.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Search Results */}
      {searchTerm && (
        <Box>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : repos.length > 0 ? (
            <List>
              {repos.map((repo) => (
                <ListItem button key={repo.id} component={Link} to={repo.html_url} target="_blank">
                  <Avatar src={repo.owner.avatar_url} alt={repo.owner.login} sx={{ marginRight: 2, width: 40, height: 40 }} />
                  <ListItemText primary={repo.name} secondary={repo.owner.login} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No repositories found</Typography>
          )}
        </Box>
      )}

      {/* Mobile Navigation Drawer */}
      <Box
        sx={{
          display: { xs: mobileOpen ? 'block' : 'none', sm: 'none' },
          position: 'absolute',
          top: 64,
          left: 0,
          right: { xs: 0, sm: 450 },
          borderRadius: '8px',
          background: theme === 'dark' ? '#1c1c1c' : 'linear-gradient(145deg, #f3f4f6, #e1e2e5)',
          zIndex: 1300,
        }}
      >
        {navLinks.map((link) => (
          <Button
            key={link.name}
            color="inherit"
            component={Link}
            to={link.to}
            sx={{ width: '100%', textAlign: 'center', padding: 2 }}
            onClick={() => setMobileOpen(false)}
          >
            {link.name}
          </Button>
        ))}
      </Box>
    </div>
  );
};

export default NavBar;