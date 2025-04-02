import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Box, Button, TextField, Toolbar, IconButton, Typography, CircularProgress, BottomNavigation, BottomNavigationAction, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '../Theme/toggleTheme';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Brightness4TwoTone, Brightness7 } from '@mui/icons-material';
import Notifications from './Notifications';
import SearchResults from './searchResults';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';


const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [repos, setRepos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [error, setError] = useState(null);
  const [showAllResults, setShowAllResults] = useState(false); // State to toggle showing all results
  const { theme, toggleTheme } = useTheme();

  const API_URL = import.meta.env.VITE_API_URL;

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

  const fetchUsers = async (query) => {
    if (query === '') return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users/search/${query}`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    fetchRepos(e.target.value);  // Fetch repos on search term change
    fetchUsers(e.target.value);  // Fetch users on search term change
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoggedInUserId(user?.uid);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getNotifications = async () => {
      if (!loggedInUserId) return;
      try {
        const response = await fetch(`${API_URL}/notifications/notifications/${loggedInUserId}`);
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError('Failed to fetch notifications');
      }
    }
    getNotifications();
  }, [loggedInUserId]);

  const navLinks = [
    { name: 'Home', to: '/',icon : <HomeIcon /> },
    { name: 'Profile', to: `/profile/${loggedInUserId}`,icon : <AccountCircleIcon /> },
    { name: 'Post', to: '/post',icon : <PostAddIcon /> },
    { name: 'Mentoring', to: '/mentoring',icon : <CodeIcon /> },
    { name: 'Chat', to: '/chat' ,icon : <ChatIcon />},
  ];

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div>
      
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h2" sx={{ flexGrow: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            <Link to="/" style={{ fontWeight: 'bold', color: 'white' }}>
              Open-Devs
            </Link>
          </Typography>

          <TextField
            placeholder="Search repositories and users..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ borderRadius: '5px' }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={toggleTheme} color="inherit">
              {theme === 'dark' ? <Brightness7 /> : <Brightness4TwoTone />}
            </IconButton>

            {loggedInUserId && <Notifications loggedInUserId={loggedInUserId} />}
          </Box>

          {/* Desktop Nav Links */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navLinks.map((link) => (
              <IconButton key={link.name} color="inherit" component={Link} to={link.to} sx={{ marginLeft: 2 }}>
                <Tooltip title={link.name} placement="bottom">
                {link.icon}
                </Tooltip>
              </IconButton>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Nav Links */}
      <Box
  sx={{
    display: { xs: 'block', sm: 'none' },
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1300, // Ensure it's above other content
    backgroundColor: theme === 'dark' ? '#1c1c1c' : '#ffffff', // Add background color
  }}
>
  <BottomNavigation showLabels>
    {navLinks.map((link) => (
      <BottomNavigationAction
        key={link.name}
        label={link.name}
        icon={link.icon}
        component={Link}
        to={link.to}
        sx={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
      />
    ))}
  </BottomNavigation>
</Box>

      {/* Search Results */}
      {searchTerm && (
        <Box sx={{ padding: 2 ,
          position: "absolute", 
          top: "64px",
          left: 0,
          right: 0,
          zIndex: 1300,
          backgroundColor: theme === 'dark' ? '#1c1c1c' : '#ffffff', }}>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <SearchResults
              users={users}
              repos={repos}
              showAll={showAllResults}
              onShowAllClick={() => setShowAllResults(!showAllResults)}
              onResultClick={() => setSearchTerm('')}  // Clears search term on click

            />
          )}
        </Box>
      )}
    </div>
  );
};

export default NavBar;