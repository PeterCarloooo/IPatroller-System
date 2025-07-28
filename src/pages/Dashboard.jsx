import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import SectionHeader from '../components/SectionHeader';
import { Card, Row, Col, Form, Badge, Stack, Button, Alert } from 'react-bootstrap';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useUserRole } from '../context/UserContext';

function Dashboard() {
  const navigate = useNavigate();
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [activeMunicipalities, setActiveMunicipalities] = useState([]);
  const [inactiveMunicipalities, setInactiveMunicipalities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const { 
    userRole, 
    userMunicipality, 
    getUserPrivileges, 
    canAccessFeature,
    getAccessibleMunicipalities 
  } = useUserRole();

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

  const stats = [
    { icon: 'fa-file-alt', color: 'info', label: 'Total Reports', value: 156 },
    { icon: 'fa-hourglass-half', color: 'warning', label: 'Pending Reports', value: 23 },
    { icon: 'fa-check-circle', color: 'success', label: 'Resolved Reports', value: 133 },
    { icon: 'fa-users', color: 'primary', label: 'Active Patrollers', value: 45 },
    { icon: 'fa-user-check', color: 'success', label: 'On Duty', value: 12 },
    { icon: 'fa-map-marker-alt', color: 'secondary', label: 'Total Areas', value: 8 },
    { icon: 'fa-user-check', color: 'success', label: 'Active Patrollers (Yesterday)', value: activeCount, badge: { bg: 'success', text: '5 Above' } },
    { icon: 'fa-user-times', color: 'danger', label: 'Inactive Patrollers (Yesterday)', value: inactiveCount, badge: { bg: 'danger', text: '4 Below' } }
  ];

  const userPrivileges = getUserPrivileges();
  const accessibleMunicipalities = getAccessibleMunicipalities();

  return (
    <DashboardLayout activePage="dashboard">
      <div className="content-wrapper page-container" style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', overflowX: 'hidden', padding: 0 }}>
        {/* Header */}
        <SectionHeader icon="fa-home" title="Dashboard" subtitle="Overview and statistics" />

        {/* User Access Information */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-user-shield text-primary me-2"></i>
                  Your Access Information
                </h5>
                <Row>
                  <Col md={4}>
                    <div className="mb-3">
                      <strong>Role:</strong>
                      <Badge bg={userRole === 'Administrator' ? 'primary' : 'secondary'} className="ms-2">
                        {userRole}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <strong>Municipality:</strong>
                      <Badge bg="info" className="ms-2">
                        {userMunicipality || 'Not Assigned'}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <strong>Privileges:</strong>
                      <span className="ms-2">{userPrivileges.length}</span>
                    </div>
                  </Col>
                </Row>
                
                {userPrivileges.length > 0 && (
                  <div className="mb-3">
                    <strong>Your Privileges:</strong>
                    <div className="mt-2">
                      {userPrivileges.map((privilege, idx) => (
                        <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                          {privilege}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <strong>Accessible Municipalities:</strong>
                  <div className="mt-2">
                    {accessibleMunicipalities.length > 0 ? (
                      accessibleMunicipalities.map((municipality, idx) => (
                        <Badge key={idx} bg="success" className="me-1 mb-1">
                          {municipality}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted">No municipalities accessible</span>
                    )}
                  </div>
                </div>

                {/* Feature Access Test */}
                <div className="mt-3">
                  <strong>Feature Access Test:</strong>
                  <div className="mt-2">
                    <Badge bg={canAccessFeature('add-user') ? 'success' : 'danger'} className="me-1 mb-1">
                      Add User: {canAccessFeature('add-user') ? 'Yes' : 'No'}
                    </Badge>
                    <Badge bg={canAccessFeature('edit-user') ? 'success' : 'danger'} className="me-1 mb-1">
                      Edit User: {canAccessFeature('edit-user') ? 'Yes' : 'No'}
                    </Badge>
                    <Badge bg={canAccessFeature('view-reports') ? 'success' : 'danger'} className="me-1 mb-1">
                      View Reports: {canAccessFeature('view-reports') ? 'Yes' : 'No'}
                    </Badge>
                    <Badge bg={canAccessFeature('system-settings') ? 'success' : 'danger'} className="me-1 mb-1">
                      System Settings: {canAccessFeature('system-settings') ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Date Selection */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Select Date for IPatroller Status</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-3 border-0 shadow-sm"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="g-4 mb-4">
          {stats.map((stat, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm h-100" style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                  <div className="mb-3">
                    <i className={`fas ${stat.icon} text-${stat.color} fs-1`}></i>
                  </div>
                  <h3 className="fw-bold mb-1" style={{ color: `var(--bs-${stat.color})` }}>
                    {stat.value}
                  </h3>
                  <p className="text-muted text-center mb-2 small">{stat.label}</p>
                  {stat.badge && (
                    <Badge bg={stat.badge.bg} className="small">
                      {stat.badge.text}
                    </Badge>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-bolt text-warning me-2"></i>
                  Quick Actions
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {canAccessFeature('view-reports') && (
                    <Button variant="outline-primary" onClick={() => navigate('/reports')}>
                      <i className="fas fa-chart-line me-2"></i>
                      View Reports
                    </Button>
                  )}
                  {canAccessFeature('add-user') && (
                    <Button variant="outline-success" onClick={() => navigate('/users')}>
                      <i className="fas fa-user-plus me-2"></i>
                      Add User
                    </Button>
                  )}
                  {canAccessFeature('system-settings') && (
                    <Button variant="outline-warning" onClick={() => navigate('/setups')}>
                      <i className="fas fa-cogs me-2"></i>
                      System Settings
                    </Button>
                  )}
                  <Button variant="outline-info" onClick={() => navigate('/ipatroller-status')}>
                    <i className="fas fa-shield-alt me-2"></i>
                    IPatroller Status
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row>
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-user-check text-success me-2"></i>
                  Active Municipalities (Yesterday)
                </h5>
                {activeMunicipalities.length > 0 ? (
                  <div>
                    {activeMunicipalities.map((muni, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">{muni.name}</span>
                        <Badge bg="success">{muni.count} patrollers</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No active municipalities for selected date</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-user-times text-danger me-2"></i>
                  Inactive Municipalities (Yesterday)
                </h5>
                {inactiveMunicipalities.length > 0 ? (
                  <div>
                    {inactiveMunicipalities.map((muni, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">{muni.name}</span>
                        <Badge bg="danger">{muni.count} patrollers</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No inactive municipalities for selected date</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard; 