import React, { useState, useMemo } from 'react';
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
  Alert,
  Badge,
  Modal,
  InputGroup,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Pagination,
  Nav,
  Tab
} from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import illegalService from '../services/illegalService';
import LoadingSpinner from './common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/common';

// Define fixed district and municipality order
const DISTRICTS = {
  '1ST DISTRICT': ['ABUCAY', 'HERMOSA', 'ORANI', 'SAMAL'],
  '2ND DISTRICT': ['BALANGA', 'ORION', 'LIMAY', 'PILAR'],
  '3RD DISTRICT': ['BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG']
};

// Violation categories with their specific types
const VIOLATION_CATEGORIES = {
  FISHING: {
    label: 'Illegal Fishing',
    icon: 'bi-water',
    types: {
      'DYNAMITE_FISHING': {
        label: 'Dynamite Fishing',
        description: 'Use of explosives for fishing',
        severity: 'critical'
      },
      'CYANIDE_FISHING': {
        label: 'Cyanide Fishing',
        description: 'Use of toxic substances for fishing',
        severity: 'critical'
      },
      'UNLICENSED_FISHING': {
        label: 'Unlicensed Fishing',
        description: 'Fishing without proper permits',
        severity: 'high'
      },
      'ILLEGAL_GEAR': {
        label: 'Illegal Fishing Gear',
        description: 'Use of prohibited fishing equipment',
        severity: 'high'
      },
      'ENDANGERED_SPECIES': {
        label: 'Endangered Species',
        description: 'Catching protected marine species',
        severity: 'critical'
      }
    }
  },
  DRUGS: {
    label: 'Illegal Drugs',
    icon: 'bi-capsule',
    types: {
      'POSSESSION': {
        label: 'Drug Possession',
        description: 'Possession of illegal drugs',
        severity: 'high'
      },
      'DISTRIBUTION': {
        label: 'Drug Distribution',
        description: 'Distribution or selling of illegal drugs',
        severity: 'critical'
      },
      'MANUFACTURING': {
        label: 'Drug Manufacturing',
        description: 'Manufacturing or processing of illegal drugs',
        severity: 'critical'
      },
      'PARAPHERNALIA': {
        label: 'Drug Paraphernalia',
        description: 'Possession of drug paraphernalia',
        severity: 'medium'
      }
    }
  },
  CONSTRUCTION: {
    label: 'Illegal Construction',
    icon: 'bi-building',
    types: {
      'NO_PERMIT': {
        label: 'No Permit',
        description: 'Construction without valid permits',
        severity: 'high'
      },
      'ZONING_VIOLATION': {
        label: 'Zoning Violation',
        description: 'Violation of zoning regulations',
        severity: 'high'
      },
      'SAFETY_VIOLATION': {
        label: 'Safety Violation',
        description: 'Violation of building safety codes',
        severity: 'critical'
      },
      'ENVIRONMENTAL': {
        label: 'Environmental',
        description: 'Environmental violations during construction',
        severity: 'high'
      }
    }
  },
  LOGGING: {
    label: 'Illegal Logging',
    icon: 'bi-tree',
    types: {
      'UNLICENSED_LOGGING': {
        label: 'Unlicensed Logging',
        description: 'Logging without proper permits',
        severity: 'high'
      },
      'PROTECTED_AREA': {
        label: 'Protected Area',
        description: 'Logging in protected areas',
        severity: 'critical'
      },
      'ENDANGERED_TREES': {
        label: 'Endangered Trees',
        description: 'Cutting of protected tree species',
        severity: 'critical'
      },
      'TRANSPORT': {
        label: 'Illegal Transport',
        description: 'Illegal transport of logged wood',
        severity: 'high'
      }
    }
  },
  MINING: {
    label: 'Illegal Mining',
    icon: 'bi-minecart-loaded',
    types: {
      'UNLICENSED_MINING': {
        label: 'Unlicensed Mining',
        description: 'Mining without proper permits',
        severity: 'high'
      },
      'PROTECTED_AREA_MINING': {
        label: 'Protected Area Mining',
        description: 'Mining in protected areas',
        severity: 'critical'
      },
      'HAZARDOUS_METHODS': {
        label: 'Hazardous Methods',
        description: 'Use of hazardous mining methods',
        severity: 'critical'
      },
      'ENVIRONMENTAL_DAMAGE': {
        label: 'Environmental Damage',
        description: 'Severe environmental damage from mining',
        severity: 'high'
      }
    }
  },
  OTHER: {
    label: 'Other Violations',
    icon: 'bi-exclamation-triangle',
    types: {
      'SQUATTING': {
        label: 'Illegal Settlement',
        description: 'Unauthorized settlement on public/private land',
        severity: 'medium'
      },
      'WASTE_DISPOSAL': {
        label: 'Illegal Waste Disposal',
        description: 'Improper disposal of waste',
        severity: 'high'
      },
      'WILDLIFE': {
        label: 'Wildlife Trading',
        description: 'Illegal trading of wildlife',
        severity: 'high'
      },
      'OTHER': {
        label: 'Other',
        description: 'Other types of violations',
        severity: 'medium'
      }
    }
  }
};

const Illegals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('FISHING');
  const [selectedDistrict, setSelectedDistrict] = useState('1ST DISTRICT');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state for new report
  const [newReport, setNewReport] = useState({
    category: activeCategory,
    district: '',
    municipality: '',
    type: '',
    description: '',
    location: '',
    evidenceFiles: [],
    status: 'PENDING',
    priority: 'MEDIUM',
    suspects: '',
    witnesses: '',
    actionTaken: ''
  });

  // Generate year options (current year and next 2 years)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }, []);

  // Generate month options
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
    }));
  }, []);

  // Fetch illegal reports data
  const { data: illegalReports, isLoading, error } = useQuery({
    queryKey: ['illegalReports', selectedYear, selectedMonth],
    queryFn: illegalService.getIllegalReports,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });

  // Mutation for adding new report
  const addReportMutation = useMutation({
    mutationFn: (report) => illegalService.createIllegalReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries(['illegalReports']);
      setShowAddModal(false);
      setNewReport({
        category: activeCategory,
        district: '',
        municipality: '',
        type: '',
        description: '',
        location: '',
        evidenceFiles: [],
        status: 'PENDING',
        priority: 'MEDIUM',
        suspects: '',
        witnesses: '',
        actionTaken: ''
      });
    }
  });

  // Mutation for updating report status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => illegalService.updateIllegalReport(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['illegalReports']);
      setShowViewModal(false);
    }
  });

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    if (!illegalReports) return [];

    return illegalReports
      .filter(report => {
        const matchesSearch = searchTerm === '' ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'ALL' || report.type === filterType;
        const matchesStatus = filterStatus === 'ALL' || report.status === filterStatus;
        const matchesDistrict = report.district === selectedDistrict;

        return matchesSearch && matchesType && matchesStatus && matchesDistrict;
      })
      .sort((a, b) => {
        // Sort by priority first, then by date
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [illegalReports, searchTerm, filterType, filterStatus, selectedDistrict]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const currentReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    // Here you would typically upload to storage and get URLs
    console.log('Files to upload:', files);
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      RESOLVED: 'success',
      CANCELLED: 'danger'
    };
    return variants[status] || 'secondary';
  };

  // Get priority badge variant
  const getPriorityBadge = (priority) => {
    const variants = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'info'
    };
    return variants[priority] || 'secondary';
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          Error loading illegal reports: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header with Category Tabs */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white">
          <Nav variant="tabs" className="border-0">
            {Object.entries(VIOLATION_CATEGORIES).map(([key, category]) => (
              <Nav.Item key={key}>
                <Nav.Link
                  active={activeCategory === key}
                  onClick={() => {
                    setActiveCategory(key);
                    setFilterType('ALL');
                  }}
                  className="d-flex align-items-center"
                >
                  <i className={`bi ${category.icon} me-2`}></i>
                  {category.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>
      </Card>

      {/* Action Bar */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="text-primary mb-0">
            <i className={`bi ${VIOLATION_CATEGORIES[activeCategory].icon} me-2`}></i>
            {VIOLATION_CATEGORIES[activeCategory].label} Reports
          </h4>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => {
              setNewReport(prev => ({ ...prev, category: activeCategory }));
              setShowAddModal(true);
            }}
            className="d-flex align-items-center"
          >
            <i className="bi bi-plus-circle me-2"></i>
            New Report
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fw-medium">District</Form.Label>
            <Form.Select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="fw-medium"
            >
              {Object.keys(DISTRICTS).map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
            <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fw-medium">Month</Form.Label>
            <Form.Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="fw-medium"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
            <Col xs={12} md={6} lg={2}>
          <Form.Group>
            <Form.Label className="fw-medium">Year</Form.Label>
            <Form.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="fw-medium"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
            <Col xs={12} md={6} lg={4}>
              <Form.Group>
                <Form.Label className="fw-medium">Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by description or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
      </Row>

          <Row className="mt-3">
            <Col xs={12} md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-medium">Violation Type</Form.Label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  {Object.entries(VIOLATION_CATEGORIES[activeCategory].types).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-medium">Status</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Statistics Cards */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Reports</h6>
                  <h3 className="mb-0">
                    {/* Add actual count */}
                    {filteredReports.length}
                  </h3>
                </div>
                <div className={`bg-primary bg-opacity-10 rounded-circle p-3`}>
                  <i className={`bi ${VIOLATION_CATEGORIES[activeCategory].icon} text-primary fs-4`}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* Add more statistics cards for different statuses */}
      </Row>

      {/* Reports Table */}
      <Card className="shadow-sm">
        <Card.Body>
      <div className="table-responsive">
            <Table hover className="align-middle">
          <thead className="bg-light">
            <tr>
                  <th>Date</th>
                  <th>Municipality</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
                {currentReports.map(report => (
                  <tr key={report.id}>
                    <td>{formatDate(report.createdAt)}</td>
                    <td>{report.municipality}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{report.location}</Tooltip>}
                      >
                        <span>{report.location.substring(0, 30)}...</span>
                      </OverlayTrigger>
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {VIOLATION_CATEGORIES[activeCategory].types[report.type]?.description}
                          </Tooltip>
                        }
                      >
                        <Badge bg="secondary">
                          {VIOLATION_CATEGORIES[activeCategory].types[report.type]?.label}
                        </Badge>
                      </OverlayTrigger>
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(report.status)}>
                        {report.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getPriorityBadge(report.priority)}>
                        {report.priority}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowViewModal(true);
                        }}
                        className="me-2"
                      >
                        View
                    </Button>
                      <Dropdown as="span">
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                          id={`action-${report.id}`}
                        >
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                          <Dropdown.Item
                            onClick={() => updateStatusMutation.mutate({
                              id: report.id,
                              status: 'IN_PROGRESS'
                            })}
                          >
                            Mark In Progress
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => updateStatusMutation.mutate({
                              id: report.id,
                              status: 'RESOLVED'
                            })}
                          >
                            Mark Resolved
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => updateStatusMutation.mutate({
                              id: report.id,
                              status: 'CANCELLED'
                            })}
                          >
                            Cancel Report
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                  </td>
                </tr>
                ))}
          </tbody>
        </Table>
      </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Showing {Math.min(itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
            </div>
            <Pagination>
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const diff = Math.abs(page - currentPage);
                  return diff === 0 || diff === 1 || page === 1 || page === totalPages;
                })
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <Pagination.Ellipsis disabled />
                        <Pagination.Item
                          active={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      </React.Fragment>
                    );
                  }
                  return (
                    <Pagination.Item
                      key={page}
                      active={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                })}
              <Pagination.Next
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      {/* Add Report Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`bi ${VIOLATION_CATEGORIES[newReport.category].icon} me-2`}></i>
            New {VIOLATION_CATEGORIES[newReport.category].label} Report
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    value={newReport.district}
                    onChange={(e) => setNewReport({
                      ...newReport,
                      district: e.target.value,
                      municipality: ''
                    })}
                  >
                    <option value="">Select District</option>
                    {Object.keys(DISTRICTS).map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Municipality</Form.Label>
                  <Form.Select
                    value={newReport.municipality}
                    onChange={(e) => setNewReport({
                      ...newReport,
                      municipality: e.target.value
                    })}
                    disabled={!newReport.district}
                  >
                    <option value="">Select Municipality</option>
                    {newReport.district && DISTRICTS[newReport.district].map(municipality => (
                      <option key={municipality} value={municipality}>
                        {municipality}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Violation Type</Form.Label>
                  <Form.Select
                    value={newReport.type}
                    onChange={(e) => setNewReport({
                      ...newReport,
                      type: e.target.value
                    })}
                  >
                    <option value="">Select Type</option>
                    {Object.entries(VIOLATION_CATEGORIES[newReport.category].types).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={newReport.priority}
                    onChange={(e) => setNewReport({
                      ...newReport,
                      priority: e.target.value
                    })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter detailed location"
                value={newReport.location}
                onChange={(e) => setNewReport({
                  ...newReport,
                  location: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter detailed description of the violation"
                value={newReport.description}
                onChange={(e) => setNewReport({
                  ...newReport,
                  description: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Suspects</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter information about suspects (if any)"
                value={newReport.suspects}
                onChange={(e) => setNewReport({
                  ...newReport,
                  suspects: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Witnesses</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter information about witnesses (if any)"
                value={newReport.witnesses}
                onChange={(e) => setNewReport({
                  ...newReport,
                  witnesses: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Initial Action Taken</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Describe any immediate actions taken"
                value={newReport.actionTaken}
                onChange={(e) => setNewReport({
                  ...newReport,
                  actionTaken: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Evidence Files</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileUpload}
              />
              <Form.Text className="text-muted">
                You can upload multiple files (photos, documents, etc.)
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => addReportMutation.mutate(newReport)}
            disabled={addReportMutation.isLoading}
          >
            {addReportMutation.isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Report Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title>
            {selectedReport && (
              <>
                <i className={`bi ${VIOLATION_CATEGORIES[selectedReport.category].icon} me-2`}></i>
                {VIOLATION_CATEGORIES[selectedReport.category].label} Report Details
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {selectedReport && (
            <>
              <Row className="mb-4">
                <Col xs={12}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Badge bg={getStatusBadge(selectedReport.status)} className="me-2">
                        {selectedReport.status}
                      </Badge>
                      <Badge bg={getPriorityBadge(selectedReport.priority)}>
                        {selectedReport.priority}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      Reported on {formatDate(selectedReport.createdAt)}
                    </small>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted">District</h6>
                  <p>{selectedReport.district}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Municipality</h6>
                  <p>{selectedReport.municipality}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted">Violation Type</h6>
                  <Badge bg="secondary">
                    {VIOLATION_CATEGORIES[selectedReport.category].types[selectedReport.type]?.label}
                  </Badge>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Location</h6>
                  <p>{selectedReport.location}</p>
                </Col>
              </Row>

              <div className="mb-3">
                <h6 className="text-muted">Description</h6>
                <p>{selectedReport.description}</p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Suspects</h6>
                <p>{selectedReport.suspects || 'No suspect information provided'}</p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Witnesses</h6>
                <p>{selectedReport.witnesses || 'No witness information provided'}</p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Initial Action Taken</h6>
                <p>{selectedReport.actionTaken || 'No initial action recorded'}</p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Evidence Files</h6>
                <Row className="g-2">
                  {selectedReport.evidenceFiles?.map((file, index) => (
                    <Col key={index} xs={6} md={4}>
                      {file.type?.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={`Evidence ${index + 1}`}
                          className="img-fluid rounded"
                        />
                      ) : (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-flex align-items-center p-2 border rounded text-decoration-none"
                        >
                          <i className="bi bi-file-earmark me-2"></i>
                          {file.name}
                        </a>
                      )}
                    </Col>
                  ))}
                </Row>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Report Timeline</h6>
                <div className="border-start border-2 ps-3">
                  <div className="mb-2">
                    <small className="text-muted">
                      {formatDate(selectedReport.createdAt)}
                    </small>
                    <p className="mb-0">Report Created</p>
                  </div>
                  {selectedReport.updates?.map((update, index) => (
                    <div key={index} className="mb-2">
                      <small className="text-muted">
                        {formatDate(update.timestamp)}
                      </small>
                      <p className="mb-0">{update.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedReport && selectedReport.status !== 'RESOLVED' && (
            <Button
              variant="success"
              onClick={() => updateStatusMutation.mutate({
                id: selectedReport.id,
                status: 'RESOLVED'
              })}
              disabled={updateStatusMutation.isLoading}
            >
              {updateStatusMutation.isLoading ? 'Updating...' : 'Mark as Resolved'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Illegals; 