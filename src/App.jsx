import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import Signup from './components/Signup';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Illegals from './components/Illegals';
import IPatroller from './components/IPatroller';
import CommandCenter from './components/CommandCenter';
import Report from './components/Report';
import Setup from './components/Setup';
import theme from './theme/theme';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Configure React Router future flags
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

// Create a custom error handler
const handleError = (error) => {
  // Log error to your error tracking service
  console.error('Application Error:', error);

  // Handle specific error types
  if (error.name === 'FirebaseError') {
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'unauthenticated':
        return 'Please log in to continue.';
      case 'unavailable':
        return 'Service is temporarily unavailable. Please try again later.';
      case 'failed-precondition':
        return 'Operation cannot be performed in the current state.';
      case 'resource-exhausted':
        return 'Too many requests. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  // Handle network errors
  if (error.name === 'NetworkError' || !navigator.onLine) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // Handle other errors
  return 'An unexpected error occurred. Please try again.';
};

// Configure Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 404s or auth errors
        if (error.code === 'permission-denied' || error.code === 'not-found') {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
      suspense: false,
      useErrorBoundary: (error) => {
        // Only use error boundary for network errors and fatal app errors
        return error.name === 'NetworkError' || error.isFatal;
      },
      onError: (error) => {
        const message = handleError(error);
        // You can show a toast notification here
        console.error('Query Error:', message);
      }
    },
    mutations: {
      retry: 1,
      useErrorBoundary: false,
      onError: (error) => {
        const message = handleError(error);
        // You can show a toast notification here
        console.error('Mutation Error:', message);
      }
    }
  }
});

// Add global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  event.preventDefault();
  const message = handleError(event.reason);
  // You can show a global error notification here
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="illegals" element={<Illegals />} />
                  <Route path="ipatroller" element={<IPatroller />} />
                  <Route path="command-center" element={<CommandCenter />} />
                  <Route path="report" element={<Report />} />
                  <Route path="setup" element={<Setup />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
