// components/ResumeFeedback.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getResumeFeedback } from '../api';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const ResumeFeedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const resume = location.state?.resume;

  useEffect(() => {
    if (!resume) {
      setError('No resume selected');
      setLoading(false);
      return;
    }

    const fetchFeedback = async () => {
      try {
        const data = await getResumeFeedback(resume.id);
        setFeedback(data);
      } catch (err) {
        setError(err.error || 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [resume]);

  if (!resume) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">No resume selected</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-resume')}
          sx={{ mt: 2 }}
        >
          Back to My Resumes
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-resume')}
        >
          Back to My Resumes
        </Button>
      </Container>
    );
  }

  if (feedback?.status === 'pending') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Generating Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {feedback.message}
          </Typography>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  if (feedback?.status === 'failed') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{feedback.message}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-resume')}
        >
          Back to My Resumes
        </Button>
      </Container>
    );
  }

  const feedbackContent = feedback?.content;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Resume Feedback
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          {resume.file_name}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Strengths
          </Typography>
          <List>
            {feedbackContent?.strengths?.map((strength, index) => (
              <ListItem key={index}>
                <ListItemText primary={strength} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Areas for Improvement
          </Typography>
          <List>
            {feedbackContent?.improvements?.map((improvement, index) => (
              <ListItem key={index}>
                <ListItemText primary={improvement} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Skill Gaps
          </Typography>
          <List>
            {feedbackContent?.skill_gaps?.map((gap, index) => (
              <ListItem key={index}>
                <ListItemText primary={gap} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          <List>
            {feedbackContent?.recommendations?.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-resume')}
          sx={{ mt: 2 }}
        >
          Back to My Resumes
        </Button>
      </Paper>
    </Container>
  );
};

export default ResumeFeedback;