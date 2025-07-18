// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PATROLLER: {
    BASE: '/patroller',
    STATS: '/patroller/stats',
    REPORTS: '/patroller/reports',
    VIOLATIONS: '/patroller/violations',
  },
  ILLEGALS: {
    BASE: '/illegals',
  },
};

// Status codes
export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  IPATROLLER: '/ipatroller',
  ILLEGALS: '/illegals',
  COMMAND_CENTER: '/command-center',
  REPORT: '/report',
  SETUP: '/setup',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REMEMBER_ME: 'rememberedUser',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Date formats
export const DATE_FORMATS = {
  FULL: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  SHORT: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  TIME: {
    hour: '2-digit',
    minute: '2-digit',
  },
};

// Validation rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    MESSAGE: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    MESSAGE: 'Username must be between 3 and 20 characters',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Unable to reach server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  DEFAULT: 'An unexpected error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in',
  LOGOUT: 'Successfully logged out',
  CREATE: 'Successfully created',
  UPDATE: 'Successfully updated',
  DELETE: 'Successfully deleted',
};

// Theme constants
export const THEME = {
  PRIMARY: {
    MAIN: '#2563eb',
    LIGHT: '#3b82f6',
    DARK: '#1d4ed8',
  },
  SECONDARY: {
    MAIN: '#7c3aed',
    LIGHT: '#8b5cf6',
    DARK: '#6d28d9',
  },
  SUCCESS: {
    MAIN: '#059669',
    LIGHT: '#10b981',
    DARK: '#047857',
  },
  ERROR: {
    MAIN: '#dc2626',
    LIGHT: '#ef4444',
    DARK: '#b91c1c',
  },
  WARNING: {
    MAIN: '#f59e0b',
    LIGHT: '#fbbf24',
    DARK: '#d97706',
  },
}; 