import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume } from '../api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

const CreateResume = () => {
  const [formData, setFormData] = useState({
    file: null,
    description: '',
    skills: []
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, file }));
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleDescriptionChange = (e) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  const handleSkillChange = (e) => {
    setCurrentSkill(e.target.value);
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('skills', JSON.stringify(formData.skills));

      await uploadResume(formDataToSend);
      setMessage('Resume uploaded successfully');
      setTimeout(() => {
        navigate('/my-resume');
      }, 1500);
    } catch (err) {
      setError(err.error || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Create Resume
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="resume-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="resume-file">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {formData.file ? formData.file.name : 'Upload PDF Resume'}
                </Button>
              </label>
            </Box>

            <TextField
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleDescriptionChange}
              fullWidth
              variant="outlined"
              placeholder="Describe your experience and qualifications..."
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={currentSkill}
                  onChange={handleSkillChange}
                  placeholder="Add a skill"
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  disabled={!currentSkill.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                disabled={loading || !formData.file}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#388E3C' },
                  minWidth: '200px'
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Resume'}
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

export default CreateResume; 