import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Table, Badge, Nav, Form } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function FullReport() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [dailyCounts, setDailyCounts] = useState([]);
  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const incidentsSnapshot = await getDocs(collection(db, 'incidents'));
        setIncidents(incidentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const dailyCountsSnapshot = await getDocs(collection(db, 'daily_counts'));
        setDailyCounts(dailyCountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Calculations ---
  const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];

  // Chart Data
  const activeData = municipalities.map(muni => users.filter(u => u.municipality === muni && u.status === 'Active').length);
  const inactiveData = municipalities.map(muni => users.filter(u => u.municipality === muni && u.status === 'Logout').length);
  const chartData = {
    labels: municipalities,
    datasets: [
      {
        label: 'Active Patrollers',
        data: activeData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Inactive Patrollers',
        data: inactiveData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Patroller Status by Municipality' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            const total = this.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Municipality Totals
  const totalPerMunicipality = municipalities.map(muni => {
    const municipalityUsers = users.filter(u => u.municipality === muni);
    const active = municipalityUsers.filter(u => u.status === 'Active').length;
    const inactive = municipalityUsers.filter(u => u.status === 'Logout').length;
    const total = active + inactive;
    const activePercentage = total > 0 ? ((active / total) * 100).toFixed(1) : 0;
    const inactivePercentage = total > 0 ? ((inactive / total) * 100).toFixed(1) : 0;
    return {
      municipality: muni,
      total,
      active,
      inactive,
      activePercentage: parseFloat(activePercentage),
      inactivePercentage: parseFloat(inactivePercentage)
    };
  }).filter(item => item.total > 0);

  // Summary
  const totalPatrollers = users.length;
  const activePatrollers = users.filter(u => u.status === 'Active').length;
  const inactivePatrollers = users.filter(u => u.status === 'Logout').length;
  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved').length;
  const pendingIncidents = incidents.filter(i => i.status === 'Pending').length;

  if (loading) {
    return (
      <DashboardLayout activePage="reports">
        <div className="page-container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading report data...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="reports">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-chart-line text-info fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Full System Report</h2>
            <p className="text-muted mb-0 small">All data connected and summarized in one place</p>
          </div>
        </div>
        {/* Summary Cards */}
        <Row className="g-4 mb-4">
          <Col md={2} sm={6} xs={12}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-primary fw-bold">{totalPatrollers}</h4>
                <p className="text-muted mb-0">Total Patrollers</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={6} xs={12}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-success fw-bold">{activePatrollers}</h4>
                <p className="text-muted mb-0">Active Patrollers</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={6} xs={12}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-danger fw-bold">{inactivePatrollers}</h4>
                <p className="text-muted mb-0">Inactive Patrollers</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={6} xs={12}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-info fw-bold">{totalIncidents}</h4>
                <p className="text-muted mb-0">Total Incidents</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={6} xs={12}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-success fw-bold">{resolvedIncidents}</h4>
                <p className="text-muted mb-0">Resolved Incidents</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={6} xs={12}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-warning fw-bold">{pendingIncidents}</h4>
                <p className="text-muted mb-0">Pending Incidents</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* Analytics Chart */}
        <Card className="shadow-sm border-0 rounded-3 mb-4">
          <Card.Body className="p-3">
            <h3 className="fw-bold mb-3">Data Analytics</h3>
            <div className="bg-light rounded-3 p-3" style={{ height: '400px' }}>
              <Bar ref={chartRef} data={chartData} options={chartOptions} />
            </div>
          </Card.Body>
        </Card>
        {/* Municipality Table */}
        <Card className="shadow-sm border-0 rounded-3 mb-4">
          <Card.Body className="p-3">
            <h3 className="fw-bold mb-3">Total Per Municipality</h3>
            <div className="table-responsive">
              <Table className="table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Municipality</th>
                    <th>Total Patrollers</th>
                    <th>Active</th>
                    <th>Active %</th>
                    <th>Inactive</th>
                    <th>Inactive %</th>
                  </tr>
                </thead>
                <tbody>
                  {totalPerMunicipality.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{item.municipality}</td>
                      <td>{item.total}</td>
                      <td><Badge bg="success">{item.active}</Badge></td>
                      <td><span className="text-success fw-semibold">{item.activePercentage}%</span></td>
                      <td><Badge bg="danger">{item.inactive}</Badge></td>
                      <td><span className="text-danger fw-semibold">{item.inactivePercentage}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        {/* Incidents Table */}
        <Card className="shadow-sm border-0 rounded-3 mb-4">
          <Card.Body className="p-3">
            <h3 className="fw-bold mb-3">Incidents Report</h3>
            <div className="table-responsive">
              <Table className="table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Municipality</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">No incidents found.</td>
                    </tr>
                  ) : (
                    incidents.slice(0, 20).map((incident) => (
                      <tr key={incident.id}>
                        <td>{incident.id}</td>
                        <td>{incident.type}</td>
                        <td>{incident.municipality}</td>
                        <td>{incident.date}</td>
                        <td>
                          <Badge bg={
                            incident.status === 'Resolved' ? 'success' : 
                            incident.status === 'Pending' ? 'warning' : 'info'
                          }>
                            {incident.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        {/* Daily Counts Table (optional) */}
        <Card className="shadow-sm border-0 rounded-3 mb-4">
          <Card.Body className="p-3">
            <h3 className="fw-bold mb-3">Daily Patroller Counts</h3>
            <div className="table-responsive">
              <Table className="table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Municipality</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyCounts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">No daily counts found.</td>
                    </tr>
                  ) : (
                    dailyCounts.slice(0, 30).map((entry, idx) => (
                      <tr key={entry.id || idx}>
                        <td>{entry.date}</td>
                        <td>{entry.municipality}</td>
                        <td>{entry.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default FullReport; 