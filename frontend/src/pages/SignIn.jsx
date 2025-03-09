import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Grid, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword, signInWithGoogle, signInWithGithub } from '../firebase/auth';
import devBg from '../assets/devBg.png';
import { useTheme } from '../Theme/toggleTheme';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme(); // Use the useTheme hook to get the current theme
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm')); // Check if the screen is mobile

  const backgroundImage = `url(${devBg})`; // Wrap the image path in url()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmailAndPassword(email, password);
      navigate('/');
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      navigate('/');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'row', // Column for mobile, row for desktop
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: backgroundImage , // Show background image below in mobile
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Left Side (Image for Desktop) */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            height: '100vh',
            backgroundImage: 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            order:2,
          }}
        />
      )}

      {/* Right Side (Form) */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
          borderRadius: 2,
          maxWidth: '400px',
          width: '100%',
          margin: isMobile ? 2 : 0, // Add margin in mobile view
          order : isMobile ? 2: 1, // Change the order in mobile view
        }}
      >
        <Typography component="h1" variant="h5" sx={{ marginBottom: 2, color: theme === 'light' ? '#000000' : '#ffffff' }}>
          Sign In
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate 
        sx={{ width: '100%' , 
          backgroundColor: theme === 'light' ? '#ffffff' : '#333333'}}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ backgroundColor: theme === 'light' ? '#ffffff' : '#333333', borderRadius: 1 }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ backgroundColor: theme === 'light' ? '#ffffff' : '#333333', borderRadius: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Sign in with Google
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="default"
          onClick={handleGithubSignIn}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Sign in with GitHub
        </Button>

        <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
          <Grid item>
            <Typography variant="body2" color={theme === 'light' ? 'textSecondary' : 'textPrimary'}>
              Don't have an account?{' '}
              <a href="/signup" style={{ textDecoration: 'none', color: theme === 'light' ? '#1976d2' : '#90caf9' }}>
                SignUp
              </a>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SignIn;