// src/components/JobManage.jsx
import React, { useState, useEffect } from 'react';
import { getJobList, updateJob, deleteJob } from '../api';
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const JobManage = () => {
  const [jobs, setJobs] = useState([]);
  const [editJob, setEditJob] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const username = user.username;
        if (!username) {
          throw new Error('No username found in localStorage');
        }
        const data = await getJobList();
        const filteredJobs = data.jobs.filter(job => job.posted_by === username);
        setJobs(filteredJobs);
      } catch (err) {
        setError(err.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleEdit = (job) => {
    setEditJob({ ...job });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedJob = await updateJob(editJob.id, editJob);
      setJobs(jobs.map(job => (job.id === updatedJob.id ? updatedJob : job)));
      setEditJob(null);
    } catch (err) {
      setError('Failed to update job');
    }
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteJob(jobToDelete.id);
      setJobs(jobs.filter(job => job.id !== jobToDelete.id));
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const handleCreateJob = () => {
    navigate('/jobs/create');
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
          My Jobs
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateJob}
            sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
          >
            Create Job
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

      {jobs.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No jobs found for you
        </Alert>
      )}

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} key={job.id}>
            <Card elevation={3}>
              <CardContent>
                {editJob && editJob.id === job.id ? (
                  <form onSubmit={handleUpdate}>
                    <Stack spacing={3}>
                      <TextField
                        label="Title"
                        value={editJob.title}
                        onChange={(e) => setEditJob({...editJob, title: e.target.value})}
                        required
                        fullWidth
                        variant="outlined"
                      />
                      <TextField
                        label="Company"
                        value={editJob.company}
                        onChange={(e) => setEditJob({...editJob, company: e.target.value})}
                        required
                        fullWidth
                        variant="outlined"
                      />
                      <TextField
                        label="Description"
                        value={editJob.description}
                        onChange={(e) => setEditJob({...editJob, description: e.target.value})}
                        required
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                      />
                      <TextField
                        label="Location"
                        value={editJob.location}
                        onChange={(e) => setEditJob({...editJob, location: e.target.value})}
                        fullWidth
                        variant="outlined"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editJob.is_active}
                            onChange={(e) => setEditJob({...editJob, is_active: e.target.checked})}
                            color="primary"
                          />
                        }
                        label="Active"
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button type="submit" variant="contained" color="primary">
                          Save
                        </Button>
                        <Button variant="outlined" onClick={() => setEditJob(null)}>
                          Cancel
                        </Button>
                      </Box>
                    </Stack>
                  </form>
                ) : (
                  <>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {job.title}
                    </Typography>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon color="primary" />
                        <Typography variant="body1">
                          <strong>Company:</strong> {job.company}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon color="primary" />
                        <Typography variant="body1">
                          <strong>Location:</strong> {job.location || 'Not specified'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <DescriptionIcon color="primary" sx={{ mt: 0.5 }} />
                        <Typography variant="body1">
                          <strong>Description:</strong> {job.description}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TimeIcon color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Posted on: {new Date(job.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </>
                )}
              </CardContent>
              {!editJob && (
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Chip
                    label={job.is_active ? "Active" : "Inactive"}
                    color={job.is_active ? "success" : "default"}
                    variant="outlined"
                    size="small"
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    onClick={() => handleEdit(job)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(job)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this job?
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

export default JobManage;