import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Box, Button, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { logout } from '../firebase/auth';

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'Contact', to: '/contact' },
    { name: 'About', to: '/about' },
  ];

  return (
    <div>
      <AppBar position='sticky' color='inherit'>
        <Toolbar>
          <IconButton
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'black', fontWeight : 'bold', fontSize: '2rem', textDecoration: 'none' }}>
              Open-Devs
            </Link>
          </Typography>

         <TextField
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && console.log('Search triggered')}
            variant="outlined"
            size="small"
            sx={{
              background: 'white',
            }}
          />

          {/* Navigation links */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navLinks.map((link) => (
              <Button key={link.name} color='inherit' component={Link} to={link.to} sx={{ marginLeft: 2 }}>
                {link.name}
              </Button>
            ))}
            <Button onClick={handleLogout}>LogOut</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: { xs: mobileOpen ? 'block' : 'none', sm: 'none' },
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
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
          >
            {link.name}
          </Button>
        ))}
      </Box>
    </div>
  );
};

export default NavBar;
