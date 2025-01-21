import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container,Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword, signInWithGoogle, signInWithGithub } from '../firebase/auth';

  const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const textFieldStyles = {
      input: {
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000', // Adjust text color
      },
      root: {
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000', // Adjust border color
          },
          '&:hover fieldset': {
            borderColor: theme.palette.mode === 'dark' ? '#bbbbbb' : '#000000', // Hover border color
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.mode === 'dark' ? '#ffffff' : '#3f51b5', // Focused border color
          },
        },
      },
    };
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
          <Container maxWidth="xs">
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 3,
                }}
              >
                <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
                  Sign In
                </Typography>
        
                <form onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    style={textFieldStyles}
                    label="Email Address"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    style={textFieldStyles}
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                </form>
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
                            <Typography variant="body2" color="textSecondary">
                              Don't have an account?{' '}
                              <a href="/signup" style={{ textDecoration: 'none' }}>
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
