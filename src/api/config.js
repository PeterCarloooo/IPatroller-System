import axios from 'axios';
import { ERROR_MESSAGES, RATE_LIMITS } from '../constants';
import { handleError } from '../utils/common';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Rate limiting configuration
const rateLimitMap = new Map();
const isRateLimited = (endpoint) => {
  const now = Date.now();
  const minutes = Math.floor(now / 60000);
  const key = `${endpoint}_${minutes}`;
  const count = rateLimitMap.get(key) || 0;
  
  if (count >= RATE_LIMITS.API_CALLS_PER_MINUTE) {
    return true;
  }
  
  rateLimitMap.set(key, count + 1);
  return false;
};

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  const currentMinute = Math.floor(now / 60000);
  
  rateLimitMap.forEach((_, key) => {
    const [, minute] = key.split('_');
    if (Number(minute) < currentMinute) {
      rateLimitMap.delete(key);
    }
  });
}, 60000);

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Check rate limiting
    const endpoint = config.url.split('?')[0];
    if (isRateLimited(endpoint)) {
      throw new Error('Too many requests. Please try again later.');
    }

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    };

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(handleError(error));
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK.OFFLINE));
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post('/auth/refresh', { refreshToken });
            const { token } = response.data;
            
            localStorage.setItem('token', token);
            api.defaults.headers.Authorization = `Bearer ${token}`;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle other errors
    return Promise.reject(handleError(error));
  }
);

// API endpoints
const endpoints = {
  auth: {
    login: (data) => api.post('/auth/login', data),
    signup: (data) => api.post('/auth/signup', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    resetPassword: (email) => api.post('/auth/reset-password', { email }),
    verifyEmail: (token) => api.post('/auth/verify-email', { token })
  },
  users: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.post('/users/change-password', data)
  },
  reports: {
    getIllegalReports: (params) => api.get('/reports/illegal', { params }),
    createIllegalReport: (data) => api.post('/reports/illegal', data),
    updateIllegalReport: (id, data) => api.put(`/reports/illegal/${id}`, data),
    deleteIllegalReport: (id) => api.delete(`/reports/illegal/${id}`),
    getPatrollerReports: (params) => api.get('/reports/patroller', { params }),
    updatePatrollerReport: (data) => api.post('/reports/patroller/batch', data)
  }
};

export { api, endpoints }; 