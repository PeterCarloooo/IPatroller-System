import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Container, Card, Row, Col, Form, Badge, Stack, Button } from 'react-bootstrap';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [activeMunicipalities, setActiveMunicipalities] = useState([]);
  const [inactiveMunicipalities, setInactiveMunicipalities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to yesterday's date in YYYY-MM-DD format
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Helper to get all days in the current month
  function getDaysInMonth(year, month) {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  const now = new Date();
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());

  useEffect(() => {
    if (!selectedDate) return;
    async function fetchIpatrollerStatus() {
      // Query daily_counts for selectedDate
      const q = query(collection(db, 'daily_counts'), where('date', '==', selectedDate));
      const snapshot = await getDocs(q);
      let active = 0;
      let inactive = 0;
      let activeMuni = [];
      let inactiveMuni = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.count === 'number') {
          if (data.count >= 5) {
            active++;
            activeMuni.push({ name: data.municipality, count: data.count });
          } else {
            inactive++;
            inactiveMuni.push({ name: data.municipality, count: data.count });
          }
        }
      });
      setActiveCount(active);
      setInactiveCount(inactive);
      setActiveMunicipalities(activeMuni);
      setInactiveMunicipalities(inactiveMuni);
    }

    fetchIpatrollerStatus();
  }, [selectedDate]);

  // Sample data for statistics
  const stats = {
    totalReports: 156,
    pendingReports: 23,
    resolvedReports: 133,
    activePatrollers: 45,
    onDutyPatrollers: 12,
    totalAreas: 8
  };

  return (
    <DashboardLayout activePage="dashboard">
      <div style={{ minHeight: '100vh', padding: '2.5rem 0' }}>
        <Container fluid style={{ maxWidth: 1400 }}>
          <Card className="shadow border-0 rounded-4 bg-white bg-opacity-75 p-4 mb-4">
            {/* Welcome Section */}
            <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light bg-opacity-75">
              <Card.Body>
                <Stack direction="horizontal" gap={4} className="align-items-center flex-wrap">
                  <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 72, height: 72 }}>
                    <i className="fas fa-tachometer-alt text-primary" style={{ fontSize: '2.2rem' }}></i>
                  </div>
                  <div>
                    <h2 className="fw-bold mb-1" style={{ fontSize: '2rem', letterSpacing: '0.5px' }}>Welcome back, Admin!</h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Here's what's happening in your patrol areas today.</p>
                  </div>
                </Stack>
              </Card.Body>
            </Card>

            {/* Statistics Cards */}
            <h5 className="fw-bold mb-3" style={{ letterSpacing: '0.5px' }}>Statistics Overview</h5>
            <Row className="g-4 mb-4">
              {[
                {
                  icon: 'fa-file-alt',
                  color: 'info',
                  label: 'Total Reports',
                  value: stats.totalReports
                },
                {
                  icon: 'fa-hourglass-half',
                  color: 'warning',
                  label: 'Pending Reports',
                  value: stats.pendingReports
                },
                {
                  icon: 'fa-check-circle',
                  color: 'success',
                  label: 'Resolved Reports',
                  value: stats.resolvedReports
                },
                {
                  icon: 'fa-users',
                  color: 'primary',
                  label: 'Active Patrollers',
                  value: stats.activePatrollers
                },
                {
                  icon: 'fa-user-check',
                  color: 'success',
                  label: 'On Duty',
                  value: stats.onDutyPatrollers
                },
                {
                  icon: 'fa-map-marker-alt',
                  color: 'secondary',
                  label: 'Total Areas',
                  value: stats.totalAreas
                },
                {
                  icon: 'fa-user-check',
                  color: 'success',
                  label: 'Active Patrollers (Yesterday)',
                  value: activeCount,
                  badge: { bg: 'success', text: '5 Above' }
                },
                {
                  icon: 'fa-user-times',
                  color: 'danger',
                  label: 'Inactive Patrollers (Yesterday)',
                  value: inactiveCount,
                  badge: { bg: 'danger', text: '4 Below' }
                }
              ].map((stat, idx) => (
                <Col xs={12} sm={6} lg={3} key={idx}>
                  <Card className="shadow-sm h-100 border-0 rounded-4 bg-white" style={{ padding: '1.2rem 0.5rem', minHeight: 180 }}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-3">
                      <div className={`rounded-circle p-3 bg-${stat.color} bg-opacity-10 mb-3 shadow-sm`} style={{ minWidth: 54, minHeight: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`fas ${stat.icon} text-${stat.color}`} style={{ fontSize: '1.7rem' }}></i>
                      </div>
                      <h6 className="fw-bold mb-1" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>{stat.label}</h6>
                      <h2 className={`fw-bold mb-0 text-${stat.color}`} style={{ fontSize: '1.5rem' }}>{stat.value}</h2>
                      {stat.badge && <Badge bg={stat.badge.bg} className="bg-opacity-75 mt-2">{stat.badge.text}</Badge>}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <hr className="my-4" style={{ opacity: 0.2 }} />
            {/* Recent Activity Section */}
            <Card className="shadow-sm border-0 mt-4 rounded-4 bg-light bg-opacity-75">
              <Card.Body>
                <h5 className="fw-bold mb-4" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>Recent Activity</h5>
                <Row className="align-items-center mb-4 gap-3">
                  <Col md="auto">
                    <span className="fw-semibold">Date:</span> <Badge bg="primary" className="bg-opacity-75 ms-2">{selectedDate}</Badge>
                  </Col>
                  <Col md="auto">
                    <Form.Select
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      style={{ minWidth: 180 }}
                    >
                      <option value="">Select a date</option>
                      {daysInMonth.map((date, idx) => {
                        const value = date.toISOString().slice(0, 10);
                        const isToday = value === new Date().toISOString().slice(0, 10);
                        return (
                          <option key={idx} value={value}>
                            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            {isToday ? ' (Today)' : ''}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Col>
                </Row>
                <Row className="g-4">
                  <Col md={6}>
                    <div className="mb-2 fw-semibold text-success">Active Municipalities <Badge bg="success" className="bg-opacity-75 ms-1">{activeMunicipalities.length}</Badge></div>
                    {activeMunicipalities.length > 0 ? (
                      <ul className="list-group list-group-flush rounded-3 shadow-sm">
                        {activeMunicipalities.map((muni, idx) => (
                          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-2 py-2">
                            <span>{muni.name}</span>
                            <Badge bg="success" className="bg-opacity-75">{muni.count}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted">No active municipalities today.</div>
                    )}
                  </Col>
                  <Col md={6}>
                    <div className="mb-2 fw-semibold text-danger">Inactive Municipalities <Badge bg="danger" className="bg-opacity-75 ms-1">{inactiveMunicipalities.length}</Badge></div>
                    {inactiveMunicipalities.length > 0 ? (
                      <ul className="list-group list-group-flush rounded-3 shadow-sm">
                        {inactiveMunicipalities.map((muni, idx) => (
                          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-2 py-2">
                            <span>{muni.name}</span>
                            <Badge bg="danger" className="bg-opacity-75">{muni.count}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted">No inactive municipalities today.</div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Card>
        </Container>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard; 