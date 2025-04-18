import React, { useState } from 'react';
import { uploadResume } from '../api';
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
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await uploadResume(formData);
      setMessage('Resume uploaded successfully');
      setFile(null);
      // Reset file input
      e.target.reset();
    } catch (err) {
      setError(err.error || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Upload Resume
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: 'action.hover',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
              component="label"
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {file ? file.name : 'Click to select PDF file'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Only PDF files are accepted
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!file || loading}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': { bgcolor: '#388E3C' },
                minWidth: '200px'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload Resume'}
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

export default ResumeUpload;