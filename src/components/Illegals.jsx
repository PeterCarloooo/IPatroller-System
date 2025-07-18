import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';
import StatusBadge from './common/StatusBadge';
import illegalService from '../services/illegalService';

const violationTypes = [
  'Unauthorized Construction',
  'Illegal Parking',
  'Waste Disposal',
  'Noise Violation',
  'Other',
];

const initialFormState = {
  type: '',
  location: '',
  description: '',
  evidence: null,
  status: 'pending',
};

const Illegals = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch illegal reports with proper error handling
  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['illegalReports'],
    queryFn: () => illegalService.getIllegalReports(),
    onError: (error) => {
      console.error('Error fetching reports:', error);
      return error;
    }
  });

  // Create mutation with proper binding
  const createMutation = useMutation({
    mutationFn: (data) => illegalService.createIllegalReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['illegalReports']);
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: 'Report created successfully',
        severity: 'success',
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create report',
        severity: 'error',
      });
    },
  });

  // Update mutation with proper binding
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => illegalService.updateIllegalReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['illegalReports']);
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: 'Report updated successfully',
        severity: 'success',
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update report',
        severity: 'error',
      });
    },
  });

  // Delete mutation with proper binding
  const deleteMutation = useMutation({
    mutationFn: (id) => illegalService.deleteIllegalReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['illegalReports']);
      setSnackbar({
        open: true,
        message: 'Report deleted successfully',
        severity: 'success',
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete report',
        severity: 'error',
      });
    },
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.type) errors.type = 'Type is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.description) errors.description = 'Description is required';
    if (formData.description && formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (report) => {
    setEditingId(report.id);
    setFormData(report);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
    setFormErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Illegal Activities Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage reported illegal activities in your area
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          New Report
        </Button>
      </Box>

      {error ? (
        <ErrorAlert 
          error={error}
          title="Failed to load reports"
          onRetry={refetch}
        />
      ) : isLoading ? (
        <LoadingSpinner message="Loading reports..." />
      ) : (
        <Grid container spacing={3}>
          {reports?.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{report.type}</Typography>
                  <StatusBadge status={report.status} />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {report.location}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {report.description}
                </Typography>
                {report.evidence && (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={report.evidence} 
                      alt="Evidence"
                      style={{ width: '100%', borderRadius: 4 }}
                    />
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(report)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(report.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
          {(!reports || reports.length === 0) && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No illegal activity reports found
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? 'Edit Report' : 'New Illegal Activity Report'}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }} error={!!formErrors.type}>
              <InputLabel>Type of Violation</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type of Violation"
              >
                {violationTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              {formErrors.type && (
                <Typography color="error" variant="caption">
                  {formErrors.type}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              error={!!formErrors.location}
              helperText={formErrors.location}
              sx={{ mt: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!formErrors.description}
              helperText={formErrors.description}
              sx={{ mt: 2 }}
            />

            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="evidence-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData({ ...formData, evidence: URL.createObjectURL(file) });
                  }
                }}
              />
              <label htmlFor="evidence-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                >
                  Upload Evidence
                </Button>
              </label>
            </Box>

            {formData.evidence && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={formData.evidence} 
                  alt="Evidence Preview" 
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default Illegals; 