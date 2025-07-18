import { Component } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  Alert
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log error to your error tracking service
    console.error('Error caught by ErrorBoundary:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  handleRetry = () => {
    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload required data
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // If we've tried too many times, show a different message
      if (this.state.errorCount >= 3) {
        return (
          <Container maxWidth="sm">
            <Box
              sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                py: 4
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  width: '100%'
                }}
              >
                <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h5" gutterBottom color="error">
                  Something's not right
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We're having trouble loading this page. Please try again later or contact support if the problem persists.
                </Typography>
                <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                  Error: {this.state.error?.message || 'Unknown error'}
                </Alert>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<HomeIcon />}
                    onClick={this.handleGoHome}
                  >
                    Go to Homepage
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Container>
        );
      }

      // Show regular error message for first few attempts
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                width: '100%'
              }}
            >
              <ErrorIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Don't worry, we can fix this. Try refreshing the page or click the retry button.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 