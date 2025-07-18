import { Box, Typography, Alert } from '@mui/material';

const CommandCenter = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Command Center
      </Typography>
      <Alert severity="info">
        Command Center functionality is coming soon.
      </Alert>
    </Box>
  );
};

export default CommandCenter; 