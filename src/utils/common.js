import { ERROR_MESSAGES } from '../constants';

// Format date to display format
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time to display format
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format datetime to display format
export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date)} ${formatTime(date)}`;
};

// Validate email format
export const isValidEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

// Validate phone number format
export const isValidPhone = (phone) => {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return errors;
};

// Format number with commas
export const formatNumber = (num) => {
  return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Comprehensive error handling
export const handleError = (error) => {
  // Network or server errors
  if (!navigator.onLine) {
    return ERROR_MESSAGES.NETWORK.OFFLINE;
  }

  if (error.name === 'TimeoutError') {
    return ERROR_MESSAGES.NETWORK.TIMEOUT;
  }

  // Firebase/Auth errors
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-email':
        return ERROR_MESSAGES.FORM.INVALID_EMAIL;
      case 'auth/user-disabled':
        return ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      case 'auth/email-already-in-use':
        return ERROR_MESSAGES.AUTH.USERNAME_TAKEN;
      case 'auth/weak-password':
        return ERROR_MESSAGES.AUTH.WEAK_PASSWORD;
      case 'auth/requires-recent-login':
        return ERROR_MESSAGES.AUTH.SESSION_EXPIRED;
      case 'permission-denied':
        return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      default:
        console.error('Firebase Error:', error);
        return error.message || ERROR_MESSAGES.DEFAULT;
    }
  }

  // API response errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return data.message || ERROR_MESSAGES.DATA.VALIDATION_FAILED;
      case 401:
        return ERROR_MESSAGES.AUTH.SESSION_EXPIRED;
      case 403:
        return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.DATA.NOT_FOUND;
      case 409:
        return ERROR_MESSAGES.DATA.DUPLICATE;
      case 422:
        return ERROR_MESSAGES.DATA.INVALID_FORMAT;
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.NETWORK.SERVER_ERROR;
      default:
        console.error('API Error:', error);
        return data.message || ERROR_MESSAGES.DEFAULT;
    }
  }

  // Axios request errors
  if (error.request) {
    console.error('Request Error:', error);
    return ERROR_MESSAGES.NETWORK.OFFLINE;
  }

  // Unknown errors
  console.error('Unknown Error:', error);
  return error.message || ERROR_MESSAGES.DEFAULT;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Generate random ID
export const generateId = (length = 10) => {
  return Math.random().toString(36).substring(2, length + 2);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 