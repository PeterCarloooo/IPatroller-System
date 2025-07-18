import React from 'react';
import { Box, CircularProgress, Typography, Container } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        p: 3
      }}
    >
      <CircularProgress
        size={40}
        thickness={4}
        sx={{
          mb: 2,
          color: 'primary.main'
        }}
      />
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          textAlign: 'center',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      >
        {message}
      </Typography>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `}
      </style>
    </Box>
  );

  return fullScreen ? (
    <Container maxWidth="sm">{content}</Container>
  ) : (
    content
  );
};

export default React.memo(LoadingSpinner); 