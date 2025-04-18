import React, { useState } from 'react';
import { requestPasswordReset } from '../api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { LockReset as LockResetIcon } from '@mui/icons-material';

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset({ email });
      setMessage('Password reset link has been sent to your email');
      setEmail('');
    } catch (err) {
      setError(err.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
              placeholder="Enter your email address"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LockResetIcon />}
              disabled={loading}
              sx={{
                bgcolor: '#2196F3',
                '&:hover': { bgcolor: '#1976D2' },
                minWidth: '200px'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
          </Stack>
        </form>

        {message && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default PasswordResetRequest;