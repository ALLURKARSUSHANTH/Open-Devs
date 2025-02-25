import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Box, Button, TextField, Toolbar, IconButton, Typography, CircularProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '../Theme/toggleTheme';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Brightness4TwoTone, Brightness7 } from '@mui/icons-material';
import Notifications from './Notifications';
import SearchResults from './searchResults';

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
      const response = await fetch(`http://localhost:5000/users/search/${query}`);
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

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'Profile', to: '/profile' },
    { name: 'Post', to: '/post' },
    { name: 'Mentoring', to: '/mentoring' },
  ];

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleMobileMenuToggle} // Toggle mobile menu
          >
            <MenuIcon />
          </IconButton>
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
              <Button key={link.name} color="inherit" component={Link} to={link.to} sx={{ marginLeft: 2 }}>
                {link.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Nav Links */}
      <Box
        sx={{
          display: { xs: mobileOpen ? 'block' : 'none', sm: 'none' },
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          background: theme === 'dark' ? '#1c1c1c' : 'linear-gradient(145deg, #f3f4f6, #e1e2e5)',
          zIndex: 1300,
          borderRadius: '8px',
          padding: 2,
        }}
      >
        {navLinks.map((link) => (
          <Button
            key={link.name}
            color="inherit"
            component={Link}
            to={link.to}
            sx={{ width: '100%', textAlign: 'center', padding: 2 }}
            onClick={handleMobileMenuToggle} // Close mobile menu on link click
          >
            {link.name}
          </Button>
        ))}
      </Box>

      {/* Search Results */}
      {searchTerm && (
        <Box sx={{ padding: 2 }}>
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
            />
          )}
        </Box>
      )}
    </div>
  );
};

export default NavBar;