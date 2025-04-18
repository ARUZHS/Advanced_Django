// src/components/MyResume.jsx
import React, { useState, useEffect } from 'react';
import { getResumeList, deleteResume, uploadResume } from '../api';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Home as HomeIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';

const MyResume = () => {
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await getResumeList();
      if (data.resumes) {
        setResumes(data.resumes);
      }
    } catch (err) {
      setError(err.error || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (resume) => {
    if (resume && resume.file_url) {
      window.open(resume.file_url, '_blank');
    }
  };

  const handleEdit = (resume) => {
    navigate('/resume/edit', { state: { resume } });
  };

  const handleDeleteClick = (resume) => {
    setSelectedResume(resume);
    setDeleteDialogOpen(true);
  };

  const handleViewFeedback = (resume) => {
    navigate('/resume-feedback', { state: { resume } });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedResume) {
        await deleteResume(selectedResume.id);
        setResumes(resumes.filter(r => r.id !== selectedResume.id));
        setDeleteDialogOpen(false);
        setSelectedResume(null);
      }
    } catch (err) {
      setError(err.error || 'Failed to delete resume');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setUploadLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace('.pdf', ''));

    try {
      await uploadResume(formData);
      // Refresh the resume list
      await fetchResumes();
    } catch (err) {
      setError(err.error || 'Failed to upload resume');
    } finally {
      setUploadLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleReturnToMain = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          My Resumes
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate('/create-resume')}
            sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
          >
            Create Resume
          </Button>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/jobs')}
            sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' } }}
          >
            Back to Jobs
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {resumes.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No resumes found. Please upload a resume.
        </Alert>
      )}

      <Grid container spacing={3}>
        {resumes.map((resume) => (
          <Grid item xs={12} md={6} key={resume.id}>
            <Card elevation={3}>
              <CardContent>
                <Stack spacing={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DescriptionIcon color="primary" />
                    <Typography variant="h6">
                      {resume.file_name || 'Untitled Resume'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <TimeIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Uploaded on: {new Date(resume.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {resume.description && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Description:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {resume.description}
                      </Typography>
                    </Box>
                  )}

                  {resume.skills && resume.skills.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Skills:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {resume.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  startIcon={<DownloadIcon />}
                  variant="contained"
                  color="primary"
                  onClick={() => handleDownload(resume)}
                >
                  Download
                </Button>
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  color="primary"
                  onClick={() => handleEdit(resume)}
                >
                  Edit
                </Button>
                <Button
                  startIcon={<FeedbackIcon />}
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleViewFeedback(resume)}
                >
                  View Feedback
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteClick(resume)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this resume? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyResume;