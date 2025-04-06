import React, { useState, useEffect } from 'react';
import { 
  useNavigate,
  useSearchParams
} from 'react-router-dom';
import { 
  sendPasswordReset,
  verifyResetCode,
  confirmPasswordResetWithCode
} from '../firebase/auth'; // Update the path
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Link
} from '@mui/material';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('request'); // 'request', 'verify', 'complete'
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: '' });
  const [resetMethods] = useState([
    { id: 'email', name: 'Email Reset Link' },
  ]);
  const [selectedMethod, setSelectedMethod] = useState('email');

  // Check for reset code in URL
  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
      verifyResetCodeHandler(code);
    }
  }, [searchParams]);

  const verifyResetCodeHandler = async (code) => {
    setLoading(true);
    const result = await verifyResetCode(code);
    setLoading(false);
    
    if (result.success) {
      setMode('complete');
      setEmail(result.email);
      setMessage({ text: 'Please enter your new password', severity: 'info' });
    } else {
      setMessage({ text: result.message, severity: 'error' });
    }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Please enter your email', severity: 'error' });
      return;
    }

    setLoading(true);
    const result = await sendPasswordReset(email);
    setLoading(false);
    
    if (result.success) {
      setMessage({ text: result.message, severity: 'success' });
    } else {
      setMessage({ text: result.message, severity: 'error' });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', severity: 'error' });
      return;
    }

    setLoading(true);
    const result = await confirmPasswordResetWithCode(oobCode, newPassword);
    setLoading(false);
    
    if (result.success) {
      setMessage({ text: result.message, severity: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage({ text: result.message, severity: 'error' });
    }
  };

  const renderResetMethod = () => {
    switch (selectedMethod) {
      case 'email':
        return (
          <form onSubmit={handleResetRequest}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
          </form>
        );
      case 'security':
        return (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Security questions reset method would be implemented here
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ minWidth: 400, maxWidth: 600, width: '100%' }}>
        <CardContent>
          {message.text && (
            <Alert severity={message.severity} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          {mode === 'request' && (
            <>
              <Typography variant="h5" gutterBottom>
                Reset Your Password
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Choose a reset method:
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {resetMethods.map((method) => (
                  <Grid item key={method.id}>
                    <Button
                      variant={selectedMethod === method.id ? 'contained' : 'outlined'}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      {method.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {renderResetMethod()}
            </>
          )}

          {mode === 'complete' && (
            <>
              <Typography variant="h5" gutterBottom>
                Set New Password
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                For: {email}
              </Typography>
              <form onSubmit={handlePasswordReset}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
              </form>
            </>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="/signIn" underline="hover">
              Back to Login
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PasswordResetPage;