import React, { useState, useMemo } from 'react';
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Card
} from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';

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

  // Generate year options (2025-2027)
  const years = useMemo(() => {
    return [2025, 2026, 2027];
  }, []);

  // Generate month options
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
    }));
  }, []);

  // Mock data for demonstration
  const mockData = useMemo(() => {
    const data = {};
    Object.entries(DISTRICTS).forEach(([district, municipalities]) => {
      data[district] = {};
      municipalities.forEach(municipality => {
        data[district][municipality] = {
          totalViolations: Math.floor(Math.random() * 50),
          resolved: Math.floor(Math.random() * 30),
          pending: Math.floor(Math.random() * 20),
          types: {
            'No Permit': Math.floor(Math.random() * 10),
            'Expired Permit': Math.floor(Math.random() * 10),
            'Code Violation': Math.floor(Math.random() * 10),
            'Safety Hazard': Math.floor(Math.random() * 10),
            'Other': Math.floor(Math.random() * 10)
          }
        };
      });
    });
    return data;
  }, []);

  // Calculate totals for selected district
  const districtTotals = useMemo(() => {
    if (!mockData[selectedDistrict]) return null;

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
      const data = mockData[selectedDistrict][municipality];
      totals.totalViolations += data.totalViolations;
      totals.resolved += data.resolved;
      totals.pending += data.pending;
      Object.entries(data.types).forEach(([type, count]) => {
        totals.types[type] += count;
      });
    });

    return totals;
  }, [selectedDistrict, mockData]);

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
                  {Math.round((districtTotals.resolved / districtTotals.totalViolations) * 100)}%
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
            {DISTRICTS[selectedDistrict].map(municipality => {
              const data = mockData[selectedDistrict][municipality];
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

      <style>
        {`
          .table th {
            background-color: #f8f9fa;
            white-space: nowrap;
          }

          .table td {
            vertical-align: middle;
          }

          .table-responsive {
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          .card {
            transition: transform 0.2s;
          }

          .card:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
    </Container>
  );
};

export default Illegals; 