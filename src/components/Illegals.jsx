import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import FormDialog from './common/FormDialog';
import ConfirmDialog from './common/ConfirmDialog';
import DataCard from './common/DataCard';
import StatusBadge from './common/StatusBadge';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';
import PageHeader from './common/PageHeader';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';
import { getIllegalReports, addIllegalReport, updateIllegalReport, deleteIllegalReport } from '../services/illegalService';

const Illegals = () => {
  // State management
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Custom hooks
  const { showToast } = useToast();
  const { 
    isOpen: isFormOpen,
    openDialog: openForm,
    closeDialog: closeForm
  } = useDialog();
  const {
    isOpen: isConfirmOpen,
    openDialog: openConfirm,
    closeDialog: closeConfirm
  } = useDialog();
  const {
    isOpen: isViewOpen,
    openDialog: openView,
    closeDialog: closeView
  } = useDialog();

  // Form state
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    reportedBy: '',
    type: '',
    status: 'pending',
    evidence: '',
    dateReported: new Date().toISOString()
  });

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getIllegalReports();
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch illegal reports');
      showToast('error', 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedReport) {
        await updateIllegalReport(selectedReport.id, formData);
        showToast('success', 'Report updated successfully');
      } else {
        await addIllegalReport(formData);
        showToast('success', 'Report added successfully');
      }
      closeForm();
      fetchReports();
      resetForm();
    } catch (err) {
      showToast('error', 'Failed to save report');
    }
  };

  // Handle report deletion
  const handleDelete = async () => {
    try {
      await deleteIllegalReport(selectedReport.id);
      showToast('success', 'Report deleted successfully');
      closeConfirm();
      fetchReports();
    } catch (err) {
      showToast('error', 'Failed to delete report');
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      location: '',
      description: '',
      reportedBy: '',
      type: '',
      status: 'pending',
      evidence: '',
      dateReported: new Date().toISOString()
    });
    setSelectedReport(null);
  };

  // Handle edit button click
  const handleEdit = (report) => {
    setSelectedReport(report);
    setFormData(report);
    openForm();
  };

  // Handle view button click
  const handleView = (report) => {
    setSelectedReport(report);
    openView();
  };

  // Handle delete button click
  const handleDeleteClick = (report) => {
    setSelectedReport(report);
    openConfirm();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <Container maxWidth={false}>
      <PageHeader 
        title="Illegal Activities Reports"
        subtitle="Manage and track reported illegal activities"
      />

      {/* Search and Filter Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            fullWidth
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <TextField
            select
            fullWidth
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="investigating">Investigating</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="dismissed">Dismissed</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={2} lg={5}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { resetForm(); openForm(); }}
            >
              New Report
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Reported By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map(report => (
                <TableRow key={report.id}>
                  <TableCell>{new Date(report.dateReported).toLocaleDateString()}</TableCell>
                  <TableCell>{report.location}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                  <TableCell>
                    <StatusBadge status={report.status} />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(report)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(report)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(report)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogs */}
      <FormDialog
        open={isFormOpen}
        title={selectedReport ? 'Edit Report' : 'New Report'}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      >
        {/* Form content */}
      </FormDialog>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete Report"
        content="Are you sure you want to delete this report? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />

      <FormDialog
        open={isViewOpen}
        title="View Report"
        onCancel={closeView}
        submitLabel={null}
      >
        {/* View content */}
      </FormDialog>
    </Container>
  );
};

export default Illegals; 