import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const JobCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    is_active: true,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await createJob(formData);
      setMessage('Job created successfully');
      // Redirect to jobs list after a short delay
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (err) {
      setError(err.error || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Create Job Listing
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />

            <TextField
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />

            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleChange}
                  name="is_active"
                  color="primary"
                />
              }
              label="Active"
            />

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                disabled={loading}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#388E3C' },
                  minWidth: '200px'
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Job'}
              </Button>
            </Box>
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

export default JobCreate;