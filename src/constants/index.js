// Authentication Status
export const AUTH_STATUS = {
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  LOADING: 'loading'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  PATROLLER: 'patroller',
  USER: 'user'
};

// Report Status
export const REPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled'
};

// Validation Rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    PATTERN_MESSAGE: 'Username can only contain letters, numbers, and underscores'
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  PHONE: {
    PATTERN: /^\+?[1-9]\d{1,14}$/
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password'
  },
  REPORTS: {
    ILLEGAL: '/reports/illegal',
    PATROLLER: '/reports/patroller'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  // Authentication Errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid username or password',
    ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
    EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in',
    PASSWORD_MISMATCH: 'Passwords do not match',
    WEAK_PASSWORD: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
    USERNAME_TAKEN: 'This username is already taken',
    INVALID_USERNAME: 'Username can only contain letters, numbers, and underscores',
    SESSION_EXPIRED: 'Your session has expired. Please log in again',
    UNAUTHORIZED: 'You are not authorized to perform this action'
  },
  
  // Network Errors
  NETWORK: {
    OFFLINE: 'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT: 'The request timed out. Please try again.',
    SERVER_ERROR: 'An error occurred on the server. Please try again later.'
  },
  
  // Data Errors
  DATA: {
    NOT_FOUND: 'The requested resource was not found',
    INVALID_FORMAT: 'The data format is invalid',
    VALIDATION_FAILED: 'Please check your input and try again',
    DUPLICATE: 'This record already exists'
  },
  
  // Form Errors
  FORM: {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    MIN_LENGTH: (field, length) => `${field} must be at least ${length} characters`,
    MAX_LENGTH: (field, length) => `${field} cannot exceed ${length} characters`,
    INVALID_FORMAT: (field) => `Please enter a valid ${field.toLowerCase()}`
  },
  
  // Default Error
  DEFAULT: 'An unexpected error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in',
    LOGOUT_SUCCESS: 'Successfully logged out',
    SIGNUP_SUCCESS: 'Account created successfully',
    PASSWORD_RESET: 'Password reset email sent',
    PASSWORD_CHANGED: 'Password changed successfully',
    EMAIL_VERIFIED: 'Email verified successfully'
  },
  DATA: {
    SAVE_SUCCESS: 'Changes saved successfully',
    DELETE_SUCCESS: 'Successfully deleted',
    UPDATE_SUCCESS: 'Successfully updated'
  }
};

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,    // 5 minutes
  MEDIUM: 30 * 60 * 1000,  // 30 minutes
  LONG: 60 * 60 * 1000,    // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000  // 24 hours
};

// Rate Limiting
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT: 15 * 60 * 1000,  // 15 minutes
  API_CALLS_PER_MINUTE: 60
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMMM D, YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss'
}; 