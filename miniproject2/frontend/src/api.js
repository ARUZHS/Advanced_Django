import axios from 'axios';

const API_URL = 'http://localhost:8000/';

const getAuthHeaders = () => {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
  console.log('Tokens:', tokens);
  return { Authorization: `Bearer ${tokens.access}` };
};

const getUserIdFromToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload.user_id;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}auth/register/`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await axios.post(`${API_URL}auth/verify-email/`, { token });
    return response.data;
  } catch (error) {
    console.error('verifyEmail error:', error.response?.data);
    throw error.response.data || { error: 'Failed to verify email' };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}auth/login/`, credentials);
    console.log('Login response:', response.data);
    
    // Store tokens
    localStorage.setItem('tokens', JSON.stringify(response.data.tokens));
    
    // Get user ID from access token
    const userId = getUserIdFromToken(response.data.tokens.access);
    console.log('Decoded user ID:', userId);
    
    // Store user data
    const userData = {
      id: userId,
      username: response.data.username
    };
    
    console.log('Storing user data:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data);
    throw error.response?.data || { error: 'Failed to login' };
  }
};

export const logoutUser = async () => {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
  const headers = getAuthHeaders();
  try {
    if (tokens.refresh) {
      await axios.post(`${API_URL}auth/logout/`, { refresh: tokens.refresh }, { headers });
    }
  } catch (error) {
    console.error('Logout failed:', error.response?.data || error.message);
    // Continue with logout even if backend fails
  }
  localStorage.removeItem('tokens');
  localStorage.removeItem('user');
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}auth/password-reset/`, { email });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const confirmPasswordReset = async (data) => {
  try {
    const response = await axios.post(`${API_URL}auth/password-reset-confirm/`, data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getResumeList = async () => {
  const headers = getAuthHeaders();
  try {
    const response = await axios.get(`${API_URL}resumes/list/`, { headers });
    return response.data;
  } catch (error) {
    console.error('getResumeList error:', error.response?.data);
    throw error.response.data || { error: 'Failed to fetch resumes' };
  }
};

export const uploadResume = async (formData) => {
  try {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    if (!tokens.access) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${API_URL}resumes/upload/`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('uploadResume error:', error.response?.data || error.message);
    throw error.response?.data || { error: error.message || 'Failed to upload resume' };
  }
};

export const getJobList = async () => {
  const headers = getAuthHeaders();
  try {
    const response = await axios.get(`${API_URL}jobs/`, { headers });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createJob = async (jobData) => {
  try {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    if (!tokens.access) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${API_URL}jobs/create/`,
      jobData,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('createJob error:', error.response?.data || error.message);
    throw error.response?.data || { error: error.message || 'Failed to create job' };
  }
};

export const updateJob = async (jobId, jobData) => {
  const headers = getAuthHeaders();
  try {
    const response = await axios.put(`${API_URL}jobs/${jobId}/update/`, jobData, { headers });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteJob = async (jobId) => {
  const headers = getAuthHeaders();
  try {
    const response = await axios.delete(`${API_URL}jobs/${jobId}/delete/`, { headers });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteResume = async (resumeId) => {
  const headers = getAuthHeaders();
  try {
    const response = await axios.delete(`${API_URL}resumes/delete/${resumeId}/`, { headers });
    return response.data;
  } catch (error) {
    console.error('deleteResume error:', error.response?.data);
    throw error.response.data || { error: 'Failed to delete resume' };
  }
};

export const getUserProfile = async () => {
  const headers = getAuthHeaders();
  try {
    const response = await axios.get(`${API_URL}auth/profile/`, { headers });
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data);
    throw error.response?.data || { error: 'Failed to get user profile' };
  }
};

export const getResumeFeedback = async (resumeId) => {
  const headers = getAuthHeaders();
  try {
    const response = await axios.get(
      `${API_URL}resumes/feedback/${resumeId}/`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('getResumeFeedback error:', error.response?.data);
    throw error.response?.data || { error: 'Failed to get resume feedback' };
  }
};