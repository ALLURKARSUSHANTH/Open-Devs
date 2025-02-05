import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Box, Button, IconButton, TextField, Toolbar, Typography, List, ListItem, ListItemText, CircularProgress, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '../Theme/toggleTheme';
import { Brightness4TwoTone, Brightness7 } from '@mui/icons-material'; 


const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [repos, setRepos] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (searchTerm) {
      fetchRepos(searchTerm);
    } else {
      setRepos([]); 
    }
  }, [searchTerm]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'Profile', to: '/profile' },
    { name: 'Post', to: '/post' },
  ];

  return (
    <div>
      <AppBar position='sticky'>
        <Toolbar>
          <IconButton
            edge='start'
            aria-label='menu'
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ fontWeight: 'bold', fontSize: '2rem', color: 'white' }}>
              Open-Devs
            </Link>
          </Typography>

          <TextField
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{borderRadius: '5px'}}
          />

<Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
      <IconButton onClick={toggleTheme} color="inherit">
        {theme === 'dark' ? (
          <Brightness7 /> 
        ) : (
          <Brightness4TwoTone />
        )}
      </IconButton>
    </Box>

          {/* Navigation links */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navLinks.map((link) => (
              <Button key={link.name} color='inherit' component={Link} to={link.to} sx={{ marginLeft: 2 }}>
                {link.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

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
                  {/* Display repo owner's avatar and repo name */}
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

      <Box
        sx={{
          display: { xs: mobileOpen ? 'block' : 'none', sm: 'none' },
          position: 'absolute',
          top: 64,
          left: 0,
          right: 450,
          background: theme === 'dark' ? '#1c1c1c' : 'linear-gradient(145deg, #f3f4f6, #e1e2e5)',
          zIndex: 1300,
        }}
      >
        {navLinks.map((link) => (
          <Button key={link.name} color="inherit" component={Link} to={link.to} sx={{ width: '100%', textAlign: 'center', padding: 2 }}>
            {link.name}
          </Button>
        ))}
      </Box>
    </div>
  );
};

export default NavBar;
