import { Paper, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const DataCard = ({
  title,
  subtitle,
  content,
  status,
  media,
  onEdit,
  onDelete,
  actions,
  elevation = 1,
}) => {
  return (
    <Paper 
      elevation={elevation}
      sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" component="h2" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {subtitle}
            </Typography>
          )}
        </Box>
        {status}
      </Box>

      {media && (
        <Box sx={{ mb: 2, flex: '1 1 auto' }}>
          {media}
        </Box>
      )}

      <Typography variant="body1" sx={{ mb: 2 }}>
        {content}
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 1, 
        mt: 'auto', 
        pt: 2 
      }}>
        {actions}
        {onEdit && (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete">
            <IconButton size="small" onClick={onDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
};

export default DataCard; 