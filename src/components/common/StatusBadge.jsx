import { Box } from '@mui/material';

const statusColors = {
  completed: {
    bg: 'success.light',
    color: 'success.dark',
  },
  'in-progress': {
    bg: 'warning.light',
    color: 'warning.dark',
  },
  pending: {
    bg: 'info.light',
    color: 'info.dark',
  },
  cancelled: {
    bg: 'error.light',
    color: 'error.dark',
  },
  default: {
    bg: 'grey.200',
    color: 'text.secondary',
  },
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || 'default';
  const colors = statusColors[normalizedStatus] || statusColors.default;

  return (
    <Box
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        py: 0.5,
        px: 1.5,
        borderRadius: 1,
        display: 'inline-block',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      {status}
    </Box>
  );
};

export default StatusBadge; 