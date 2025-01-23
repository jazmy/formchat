import axios from 'axios';
import logger from './logger';

// Remove /api from the base URL since we'll add it in the routes
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper to check if request is a logging request
const isLoggingRequest = (config) => {
  return config.url?.includes('/logs');
};

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // Skip logging for log requests to avoid infinite loops
    if (!isLoggingRequest(config)) {
      logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
      });
    }
    return config;
  },
  (error) => {
    if (!isLoggingRequest(error.config)) {
      logger.error('API Request Error:', {
        error: error.message,
        stack: error.stack
      });
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Skip logging for log requests to avoid infinite loops
    if (!isLoggingRequest(response.config)) {
      logger.info(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (!isLoggingRequest(error.config)) {
      logger.error('API Response Error:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        data: error.response?.data,
        error: error.message,
        stack: error.stack
      });
    }
    return Promise.reject(error);
  }
);

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Debug interceptor to log requests
api.interceptors.request.use(request => {
  console.log('API Request:', {
    url: `${request.baseURL}${request.url}`,
    method: request.method,
    data: request.data
  });
  return request;
});

// Add error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// All paths should be relative to /api now
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const getForms = async () => {
  try {
    console.log('Fetching forms...');
    const response = await api.get('/forms');
    console.log('Forms API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const createForm = async (formData) => {
  try {
    console.log('Creating form with data:', formData);
    const response = await api.post('/forms', formData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getFormDetails = async (formId) => {
  try {
    console.log('Fetching form details for:', formId);
    if (!formId) {
      throw new Error('Form ID is required');
    }
    const response = await api.get(`/forms/${formId}`);
    console.log('Form details response:', response.data);
    
    // Validate the response data
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    if (!response.data.prompts || !Array.isArray(response.data.prompts)) {
      throw new Error('Form data is missing required prompts array');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching form details:', error.response?.data || error);
    if (error.response?.status === 404) {
      throw new Error('Form not found');
    }
    throw error;
  }
};

export const getFormDetailsNew = async (formId) => {
  try {
    const response = await api.get(`/forms/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting form details:', error);
    throw error;
  }
};

export const getFormResponses = async (formId) => {
  try {
    const response = await api.get(`/responses/${formId}`);
    console.log(`Fetched responses for form ${formId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching responses for form ${formId}:`, error);
    throw error;
  }
};

export const submitResponse = async (formId, { responseid, answers }) => {
  try {
    console.log('Submitting response:', { formId, responseid, answers });
    const response = await api.post(`/responses/${formId}`, { 
      responseid: responseid || null,  // Ensure responseid is null if undefined
      answers 
    });
    
    if (!response?.data) {
      console.error('No data in response:', response);
      throw new Error('No data received from server');
    }
    
    if (!response.data.responseid) {
      console.error('No responseid in data:', response.data);
      throw new Error('No response ID in server response');
    }
    
    console.log('Submit response result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting response:', error.response?.data || error);
    throw error;
  }
};

export const updateResponse = async (formId, responseId, responses) => {
  const response = await api.patch(`/responses/${formId}/${responseId}`, { responses });
  return response.data;
};

export const exportResponses = async (formId, responseIds = null) => {
  try {
    const response = await api.get(`/forms/${formId}/export`, {
      params: { responseIds: responseIds?.join(',') },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting responses:', error);
    throw error;
  }
};

export const updateForm = async (formId, formData) => {
  try {
    console.log('Updating form:', formId, formData); // Debug log
    const response = await api.put(`/forms/${formId}`, formData);
    console.log('Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getAnswerGuidance = async (question, answer, validationCriteria, previousQA = []) => {
  try {
    console.log('Getting guidance for:', {
      question,
      answer,
      validationCriteria,
      previousQA
    });
    
    if (!validationCriteria) {
      validationCriteria = 'Provide a response that answers the question.';
    }

    const response = await api.post('/forms/guidance', {
      question,
      answer,
      validation_criteria: validationCriteria,
      previousQA
    });

    console.log('Raw guidance response:', response);

    // Handle different response formats
    let guidance;
    if (response.data?.guidance) {
      guidance = response.data.guidance;
    } else if (typeof response.data === 'string') {
      guidance = response.data;
    } else if (response.data?.message) {
      guidance = response.data.message;
    } else {
      console.error('Unexpected guidance response format:', response.data);
      throw new Error('Invalid guidance response format from server');
    }

    // Ensure we have a valid string response
    if (typeof guidance !== 'string' || !guidance.trim()) {
      throw new Error('Empty or invalid guidance response');
    }

    return guidance;
  } catch (error) {
    console.error('Error getting answer guidance:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(
      error.response?.data?.message || 
      error.response?.data || 
      error.message || 
      'Failed to get answer guidance'
    );
  }
};

export const validateAnswer = async (formId, promptIndex, answer, validationCriteria) => {
  try {
    const response = await api.post(`/forms/${formId}/validate`, {
      promptIndex,
      answer,
      validationCriteria
    });
    return response.data;
  } catch (error) {
    console.error('Error validating answer:', error);
    throw error;
  }
};

export const deleteForm = async (formId) => {
  try {
    console.log('Deleting form:', formId);
    const response = await api.delete(`/forms/${formId}`);
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteResponse = async (formId, responseId) => {
  try {
    console.log('Deleting response:', { formId, responseId });
    const response = await api.delete(`/responses/${formId}/response/${responseId}`);
    return response.data;
  } catch (error) {
    console.error('Delete response error:', error.response?.data || error);
    throw error;
  }
};

export const deleteBulkResponses = async (formId, responseIds) => {
  try {
    const response = await api.post(`/responses/${formId}/delete`, {
      responseIds
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadFormResponses = async (formId) => {
  try {
    const response = await api.get(`/forms/${formId}/export`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `form_responses_${formId}_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading responses:', error);
    throw error;
  }
};

export const getFinalOutput = async (formId, responses, previousQA) => {
  try {
    console.log('Getting final output for form:', formId, { responses, previousQA });
    const response = await api.post(`/forms/${formId}/output`, {
      responses,
      previousQA
    });
    console.log('Final output response:', response.data);
    return response.data.output;
  } catch (error) {
    console.error('Error getting final output:', error.response?.data || error);
    throw error;
  }
};

export const generateOutput = async (formId, responses) => {
  try {
    // If responses is already an array, use it directly
    // Otherwise, if it has an answers array, use that
    const answersArray = Array.isArray(responses) ? responses : 
                        (responses?.answers || []);

    const response = await api.post(`/forms/${formId}/output`, { 
      responses: answersArray 
    });
    return response.data;
  } catch (error) {
    logger.error('Error generating output:', {
      error: error.message,
      formId,
      stack: error.stack
    });
    throw error;
  }
};

// Settings API
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (settings) => {
  const response = await api.post('/settings', settings);
  return response.data;
};

export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to update password. Please check your current password and try again.'
    );
  }
};

export const deleteSetting = async (key) => {
  const response = await api.delete(`/settings/${key}`);
  return response.data;
};

export default api; 