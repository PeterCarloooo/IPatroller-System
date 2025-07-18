import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  InputGroup,
  Badge
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaFilter 
} from 'react-icons/fa';
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
    <Container fluid>
      <PageHeader 
        title="Illegal Activities Reports"
        subtitle="Manage and track reported illegal activities"
      />

      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col md={6} lg={4}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4} lg={3}>
          <InputGroup>
            <InputGroup.Text>
              <FaFilter />
            </InputGroup.Text>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </Form.Select>
          </InputGroup>
        </Col>
        <Col md={2} lg={5} className="text-end">
          <Button variant="primary" onClick={() => { resetForm(); openForm(); }}>
            <FaPlus className="me-2" />
            New Report
          </Button>
        </Col>
      </Row>

      {/* Reports Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.id}>
                  <td>{new Date(report.dateReported).toLocaleDateString()}</td>
                  <td>{report.location}</td>
                  <td>{report.type}</td>
                  <td>{report.reportedBy}</td>
                  <td>
                    <StatusBadge status={report.status} />
                  </td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleView(report)}
                    >
                      <FaEye />
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(report)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(report)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Report Dialog */}
      <FormDialog
        show={isFormOpen}
        onHide={closeForm}
        onSubmit={handleSubmit}
        title={selectedReport ? 'Edit Report' : 'New Report'}
      >
        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Type of Illegal Activity</Form.Label>
          <Form.Control
            type="text"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Reported By</Form.Label>
          <Form.Control
            type="text"
            value={formData.reportedBy}
            onChange={(e) => setFormData({...formData, reportedBy: e.target.value})}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Evidence (URL)</Form.Label>
          <Form.Control
            type="text"
            value={formData.evidence}
            onChange={(e) => setFormData({...formData, evidence: e.target.value})}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Form.Select>
        </Form.Group>
      </FormDialog>

      {/* View Report Dialog */}
      <FormDialog
        show={isViewOpen}
        onHide={closeView}
        title="Report Details"
        readOnly
      >
        {selectedReport && (
          <>
            <DataCard label="Location" value={selectedReport.location} />
            <DataCard label="Type" value={selectedReport.type} />
            <DataCard label="Description" value={selectedReport.description} />
            <DataCard label="Reported By" value={selectedReport.reportedBy} />
            <DataCard label="Status" value={selectedReport.status} />
            <DataCard 
              label="Date Reported" 
              value={new Date(selectedReport.dateReported).toLocaleString()} 
            />
            {selectedReport.evidence && (
              <DataCard 
                label="Evidence" 
                value={
                  <a href={selectedReport.evidence} target="_blank" rel="noopener noreferrer">
                    View Evidence
                  </a>
                } 
              />
            )}
          </>
        )}
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={isConfirmOpen}
        onHide={closeConfirm}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
      />
    </Container>
  );
};

export default Illegals; 