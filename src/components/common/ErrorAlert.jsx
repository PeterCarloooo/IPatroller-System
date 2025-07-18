import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const ErrorAlert = ({ 
  error, 
  title = 'Error', 
  onRetry,
  showRetry = true 
}) => {
  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Alert 
        severity="error"
        action={
          showRetry && onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </Alert>
    </Box>
  );
};

export default ErrorAlert; 