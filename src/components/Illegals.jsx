import React, { useState, useMemo } from 'react';
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
  Alert
} from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import illegalService from '../services/illegalService';
import LoadingSpinner from './common/LoadingSpinner';

// Define fixed district and municipality order
const DISTRICTS = {
  '1ST DISTRICT': [
    'ABUCAY',
    'HERMOSA',
    'ORANI',
    'SAMAL'
  ],
  '2ND DISTRICT': [
    'BALANGA',
    'ORION',
    'LIMAY',
    'PILAR'
  ],
  '3RD DISTRICT': [
    'BAGAC',
    'DINALUPIHAN',
    'MARIVELES',
    'MORONG'
  ]
};

const Illegals = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('1ST DISTRICT');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Generate year options (current year and next 2 years)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
  });

  // Process and filter data based on selection
  const processedData = useMemo(() => {
    if (!illegalReports) return null;

    const filteredReports = illegalReports.filter(report => {
      const reportDate = new Date(report.createdAt.seconds * 1000);
      return (
        reportDate.getMonth() + 1 === selectedMonth &&
        reportDate.getFullYear() === selectedYear
      );
    });

    const data = {};
    Object.entries(DISTRICTS).forEach(([district, municipalities]) => {
      data[district] = {};
      municipalities.forEach(municipality => {
        const municipalityReports = filteredReports.filter(
          report => report.municipality === municipality
        );

        data[district][municipality] = {
          totalViolations: municipalityReports.length,
          resolved: municipalityReports.filter(report => report.status === 'resolved').length,
          pending: municipalityReports.filter(report => report.status === 'pending').length,
          types: {
            'No Permit': municipalityReports.filter(report => report.type === 'No Permit').length,
            'Expired Permit': municipalityReports.filter(report => report.type === 'Expired Permit').length,
            'Code Violation': municipalityReports.filter(report => report.type === 'Code Violation').length,
            'Safety Hazard': municipalityReports.filter(report => report.type === 'Safety Hazard').length,
            'Other': municipalityReports.filter(report => report.type === 'Other').length
          }
        };
      });
    });
    return data;
  }, [illegalReports, selectedMonth, selectedYear]);

  // Calculate totals for selected district
  const districtTotals = useMemo(() => {
    if (!processedData || !processedData[selectedDistrict]) return null;

    const totals = {
      totalViolations: 0,
      resolved: 0,
      pending: 0,
      types: {
        'No Permit': 0,
        'Expired Permit': 0,
        'Code Violation': 0,
        'Safety Hazard': 0,
        'Other': 0
      }
    };

    DISTRICTS[selectedDistrict].forEach(municipality => {
      const data = processedData[selectedDistrict][municipality];
      totals.totalViolations += data.totalViolations;
      totals.resolved += data.resolved;
      totals.pending += data.pending;
      Object.entries(data.types).forEach(([type, count]) => {
        totals.types[type] += count;
      });
    });

    return totals;
  }, [selectedDistrict, processedData]);

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
      <h4 className="text-primary border-bottom border-primary pb-2 mb-4">
        Illegals Report
      </h4>

      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} md={4}>
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
        <Col xs={12} sm={6} md={4}>
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
        <Col xs={12} sm={6} md={4}>
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
      </Row>

      {/* District Summary Cards */}
      {districtTotals && (
        <Row className="mb-4 g-3">
          <Col xs={12} sm={6} md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Total Violations</h6>
                <h3 className="mb-0 text-primary">{districtTotals.totalViolations}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Resolved</h6>
                <h3 className="mb-0 text-success">{districtTotals.resolved}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Pending</h6>
                <h3 className="mb-0 text-warning">{districtTotals.pending}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-2">Resolution Rate</h6>
                <h3 className="mb-0 text-info">
                  {districtTotals.totalViolations > 0
                    ? Math.round((districtTotals.resolved / districtTotals.totalViolations) * 100)
                    : 0}%
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Violations Table */}
      <div className="table-responsive">
        <Table bordered hover className="align-middle">
          <thead className="bg-light">
            <tr>
              <th className="fw-medium">Municipality</th>
              <th className="text-center fw-medium">Total Violations</th>
              <th className="text-center fw-medium">No Permit</th>
              <th className="text-center fw-medium">Expired Permit</th>
              <th className="text-center fw-medium">Code Violation</th>
              <th className="text-center fw-medium">Safety Hazard</th>
              <th className="text-center fw-medium">Other</th>
              <th className="text-center fw-medium">Resolved</th>
              <th className="text-center fw-medium">Pending</th>
              <th className="text-center fw-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedData && DISTRICTS[selectedDistrict].map(municipality => {
              const data = processedData[selectedDistrict][municipality];
              return (
                <tr key={municipality}>
                  <td className="fw-medium">{municipality}</td>
                  <td className="text-center">{data.totalViolations}</td>
                  <td className="text-center">{data.types['No Permit']}</td>
                  <td className="text-center">{data.types['Expired Permit']}</td>
                  <td className="text-center">{data.types['Code Violation']}</td>
                  <td className="text-center">{data.types['Safety Hazard']}</td>
                  <td className="text-center">{data.types['Other']}</td>
                  <td className="text-center text-success fw-medium">{data.resolved}</td>
                  <td className="text-center text-warning fw-medium">{data.pending}</td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm">
                      View Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Table Footer with Totals */}
          {districtTotals && (
            <tfoot className="bg-light fw-medium">
              <tr>
                <td>TOTAL</td>
                <td className="text-center">{districtTotals.totalViolations}</td>
                <td className="text-center">{districtTotals.types['No Permit']}</td>
                <td className="text-center">{districtTotals.types['Expired Permit']}</td>
                <td className="text-center">{districtTotals.types['Code Violation']}</td>
                <td className="text-center">{districtTotals.types['Safety Hazard']}</td>
                <td className="text-center">{districtTotals.types['Other']}</td>
                <td className="text-center text-success">{districtTotals.resolved}</td>
                <td className="text-center text-warning">{districtTotals.pending}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </Table>
      </div>
    </Container>
  );
};

export default Illegals; 