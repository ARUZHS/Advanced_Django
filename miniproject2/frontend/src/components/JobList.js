import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobList, logoutUser } from '../api';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  ManageAccounts as ManageIcon,
  Description as ResumeIcon,
  Logout as LogoutIcon,
  LockReset as ResetIcon
} from '@mui/icons-material';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobList();
        setJobs(data.jobs);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleManageJobs = () => {
    navigate('/jobs/manage');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleMyResumes = () => {
    navigate('/my-resume');
  };

  const handlePasswordReset = () => {
    navigate('/password-reset');
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Job Listings
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<ManageIcon />}
            onClick={handleManageJobs}
            sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
          >
            My Jobs
          </Button>
          <Button
            variant="contained"
            startIcon={<ResumeIcon />}
            onClick={handleMyResumes}
            sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' } }}
          >
            My Resumes
          </Button>
          <Button
            variant="contained"
            startIcon={<ResetIcon />}
            onClick={handlePasswordReset}
            sx={{ bgcolor: '#03A9F4', '&:hover': { bgcolor: '#0288D1' } }}
          >
            Password Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
          >
            Logout
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
          No jobs available
        </Alert>
      )}

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} key={job.id}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
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
                    <PersonIcon color="primary" />
                    <Typography variant="body1">
                      <strong>Posted by:</strong> {job.posted_by}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <TimeIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Posted on: {new Date(job.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Chip
                  icon={<WorkIcon />}
                  label="Active"
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default JobList;