import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail } from '../api';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setError('No verification token provided');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err.error || 'Failed to verify email');
      }
    };

    verify();
  }, [token]);

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {status === 'verifying' && (
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={60} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Verifying your email...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your email address.
            </Typography>
          </Stack>
        )}

        {status === 'success' && (
          <Stack spacing={3} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Email Verified Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your email has been verified. You can now log in to your account.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': { bgcolor: '#388E3C' },
                minWidth: '200px'
              }}
            >
              Go to Login
            </Button>
          </Stack>
        )}

        {status === 'error' && (
          <Stack spacing={3} alignItems="center">
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{
                bgcolor: '#2196F3',
                '&:hover': { bgcolor: '#1976D2' },
                minWidth: '200px'
              }}
            >
              Go to Login
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail;