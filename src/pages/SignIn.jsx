import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword } from '../firebase/auth';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
