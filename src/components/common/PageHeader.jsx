import { Box, Typography, Button } from '@mui/material';

const PageHeader = ({
  title,
  subtitle,
  action,
  actionIcon: ActionIcon,
  actionLabel,
  onActionClick,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: subtitle ? 1 : 0
      }}>
        <Typography variant="h4" gutterBottom={!subtitle}>
          {title}
        </Typography>
        {action && (
          <Button
            variant="contained"
            startIcon={ActionIcon && <ActionIcon />}
            onClick={onActionClick}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader; 