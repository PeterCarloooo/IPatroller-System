import { Box, Typography, Alert } from '@mui/material';

const Report = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Alert severity="info">
        Reports functionality is coming soon.
      </Alert>
    </Box>
  );
};

export default Report; 