import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Button, 
  TextField, 
  Toolbar, 
  IconButton, 
  Typography, 
  CircularProgress, 
  BottomNavigation, 
  BottomNavigationAction, 
  Tooltip,
  Paper,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Avatar,
  ClickAwayListener
} from '@mui/material';
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
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [repos, setRepos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [error, setError] = useState(null);
  const [showAllResults, setShowAllResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchRepos = async (query) => {
    if (query === '') {
      setRepos([]);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${query}`);
      const data = await response.json();
      setRepos(data.items || []);
    } catch (err) {
      setError('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (query) => {
    if (query === '') {
      setUsers([]);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users/search/${query}`);
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 2) {
      fetchRepos(value);
      fetchUsers(value);
    } else {
      setRepos([]);
      setUsers([]);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setRepos([]);
    setUsers([]);
    setMobileSearchOpen(false);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoggedInUserId(user?.uid);
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Home', to: '/', icon: <HomeIcon /> },
    { name: 'Profile', to: `/profile/${loggedInUserId}`, icon: <AccountCircleIcon /> },
    { name: 'Post', to: '/post', icon: <PostAddIcon /> },
    { name: 'Mentoring', to: '/mentoring', icon: <CodeIcon /> },
    { name: 'Chat', to: '/chat', icon: <ChatIcon /> },
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileSearchToggle = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (mobileSearchOpen) {
      clearSearch();
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setMobileSearchOpen(false)}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar 
          position="sticky" 
          elevation={1}
          sx={{ 
            backgroundColor: theme === 'dark' ? 'background.paper' : 'primary.main',
            color: theme === 'dark' ? 'text.primary' : 'primary.contrastText',
            borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Left Section - Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography
                variant="h6"
                noWrap
                component={Link}
                to="/"
                sx={{
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <CodeIcon sx={{ mr: 1 }} />
                Open-Devs
              </Typography>
            </Box>

            {/* Middle Section - Search (Desktop) */}
            <Box sx={{ 
              flexGrow: 1, 
              maxWidth: 600, 
              mx: 3,
              display: { xs: 'none', sm: 'block' } 
            }}>
              <TextField
                fullWidth
                placeholder="Search repositories and users..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                InputProps={{
                  sx: {
                    borderRadius: '20px',
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                    color: 'inherit',
                    '& fieldset': { border: 'none' }
                  },
                  startAdornment: <SearchIcon sx={{ color: 'inherit', mr: 1 }} />,
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={clearSearch}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Box>

            {/* Right Section - Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Mobile Search Toggle */}
              <IconButton
                color="inherit"
                onClick={handleMobileSearchToggle}
                sx={{ display: { xs: 'flex', sm: 'none' }, mr: 1 }}
              >
                <SearchIcon />
              </IconButton>

              {/* Theme Toggle */}
              <Tooltip title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleTheme}
                  sx={{ mx: 0.5 }}
                >
                  {theme === 'dark' ? <Brightness7 /> : <Brightness4TwoTone />}
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              {loggedInUserId && (
                <Notifications 
                  loggedInUserId={loggedInUserId} 
                  sx={{ mx: 0.5 }} 
                />
              )}

              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, ml: 1 }}>
                {navLinks.map((link) => (
                  <Tooltip key={link.name} title={link.name} placement="bottom">
                    <IconButton
                      color="inherit"
                      component={Link}
                      to={link.to}
                      sx={{ 
                        mx: 0.5,
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      {link.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>

              {/* Mobile Menu */}
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ display: { xs: 'flex', sm: 'none' }, ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>

          {/* Mobile Search Field */}
          {mobileSearchOpen && (
            <Box sx={{ 
              px: 2, 
              pb: 2,
              display: { xs: 'block', sm: 'none' } 
            }}>
              <TextField
                fullWidth
                placeholder="Search repositories and users..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                autoFocus
                InputProps={{
                  sx: {
                    borderRadius: '20px',
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                    color: 'inherit',
                    '& fieldset': { border: 'none' }
                  },
                  startAdornment: <SearchIcon sx={{ color: 'inherit', mr: 1 }} />,
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={clearSearch}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Box>
          )}
        </AppBar>

        {/* Mobile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              width: '80vw',
              maxWidth: 300,
              mt: 1,
              backgroundColor: theme === 'dark' ? 'background.paper' : 'background.default'
            }
          }}
        >
          {navLinks.map((link) => (
            <MenuItem 
              key={link.name} 
              component={Link} 
              to={link.to} 
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {React.cloneElement(link.icon, { sx: { mr: 2 } })}
                <Typography variant="body1">{link.name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* Mobile Bottom Navigation */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1300,
            display: { xs: 'block', sm: 'none' },
            borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
          }} 
          elevation={3}
        >
          <BottomNavigation 
            showLabels
            sx={{
              backgroundColor: theme === 'dark' ? 'background.paper' : 'background.default'
            }}
          >
            {navLinks.map((link) => (
              <BottomNavigationAction
                key={link.name}
                label={link.name}
                icon={link.icon}
                component={Link}
                to={link.to}
                sx={{
                  minWidth: 'auto',
                  px: 1,
                  color: theme === 'dark' ? 'text.secondary' : 'text.primary',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>

        {/* Search Results */}
        {searchTerm && (
          <Paper 
            sx={{ 
              position: 'absolute', 
              top: mobileSearchOpen ? '112px' : '64px',
              left: 0,
              right: 0,
              zIndex: 1200,
              mx: { xs: 0, sm: 3 },
              maxHeight: '70vh',
              overflow: 'auto',
              backgroundColor: theme === 'dark' ? 'background.paper' : 'background.default',
              borderRadius: 2,
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
            ) : (
              <SearchResults
                users={users}
                repos={repos}
                showAll={showAllResults}
                onShowAllClick={() => setShowAllResults(!showAllResults)}
                onResultClick={clearSearch}
                theme={theme}
              />
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default NavBar;