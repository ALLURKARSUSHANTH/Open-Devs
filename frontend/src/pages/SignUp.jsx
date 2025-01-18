import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container,Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerWithEmailAndPassword, signInWithGoogle, signInWithGithub } from '../firebase/auth';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password===confirmPassword){
      setLoading(true);
    try{
      await registerWithEmailAndPassword(email,password);
      navigate('/');
    }
    catch(error){
      console.log('Error signing Up:',error.message);
    }
    finally{
      setLoading(false);
    }  
  }
  else{
    alert("Passwords do not match");
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
          Sign Up
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
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Signing up...' : 'Sign up'}
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
                      Already have an account?{' '}
                      <a href="/signin" style={{ textDecoration: 'none' }}>
                        Sign in
                      </a>
                    </Typography>
                  </Grid>
                </Grid>
      </Box>
    </Container>
  );
};

export default SignUp;