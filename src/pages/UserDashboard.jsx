import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Container, Card, Row, Col, Stack, Button, Badge } from 'react-bootstrap';
import { useUserRole } from '../context/UserContext';
import SectionHeader from '../components/SectionHeader';

function UserDashboard() {
  const { userRole, userMunicipality, getUserPrivileges, hasPrivilege } = useUserRole();
  const userPrivileges = getUserPrivileges();

  return (
    <DashboardLayout activePage="user-dashboard">
      <div className="page-container">
        {/* Header */}
        <SectionHeader icon="fa-user" title="User Dashboard" subtitle="Here's your personalized dashboard overview" />

        <Row className="g-4">
          {/* User Information Card */}
          <Col xs={12} lg={6}>
            <Card className="shadow-sm border-0 rounded-4 h-100" style={{ width: '100vw', minHeight: '100vh', margin: 0, borderRadius: 0 }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{ 
                    width: 48, 
                    height: 48, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-user-circle" style={{ fontSize: '1.3rem' }}></i>
                  </div>
                  <h3 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>User Information</h3>
                </div>
                <div className="mb-4">
                  <p className="text-muted mb-2 fw-semibold">Your Role</p>
                  <Badge bg="primary" className="fs-6 px-3 py-2 fw-bold" style={{ fontSize: '0.9rem' }}>
                    <i className="fas fa-crown me-2"></i>{userRole}
                  </Badge>
                </div>
                {userMunicipality && (
                  <div className="mb-4">
                    <p className="text-muted mb-2 fw-semibold">Municipality</p>
                    <Badge bg="info" className="fs-6 px-3 py-2 fw-bold" style={{ fontSize: '0.9rem' }}>
                      <i className="fas fa-map-marker-alt me-2"></i>{userMunicipality}
                    </Badge>
                  </div>
                )}
                <div className="mt-4">
                  <Button variant="outline-primary" className="fw-semibold px-4 py-2 rounded-3">
                    <i className="fas fa-edit me-2"></i>Edit Profile
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Privileges Card */}
          <Col xs={12} lg={6}>
            <Card className="shadow-sm border-0 rounded-4 h-100" style={{ width: '100vw', minHeight: '100vh', margin: 0, borderRadius: 0 }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{ 
                    width: 48, 
                    height: 48, 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-shield-alt" style={{ fontSize: '1.3rem' }}></i>
                  </div>
                  <h3 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Your Privileges</h3>
                </div>
                {userPrivileges.length > 0 ? (
                  <div>
                    <p className="text-muted mb-3 fw-semibold">You have access to the following features:</p>
                    <div className="d-flex flex-wrap gap-2">
                      {userPrivileges.map((privilege, index) => (
                        <Badge key={index} bg="success" className="fs-6 px-3 py-2 fw-bold" style={{ fontSize: '0.85rem' }}>
                          <i className="fas fa-check me-1"></i>
                          {privilege}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-lock text-muted" style={{ fontSize: '3.5rem' }}></i>
                    <p className="text-muted mt-3 mb-1 fw-semibold">No privileges assigned</p>
                    <p className="text-muted small">Contact your administrator for access</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Access Card */}
          <Col xs={12}>
            <Card className="shadow-sm border-0 rounded-4" style={{ width: '100%', height: 'calc(100vh - 80px)', margin: 0, borderRadius: '1rem', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{ 
                    width: 48, 
                    height: 48, 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-rocket" style={{ fontSize: '1.3rem' }}></i>
                  </div>
                  <h3 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Quick Access</h3>
                </div>
                <Row className="g-4">
                  <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm h-100 hover-card" style={{ transition: 'all 0.3s ease' }}>
                      <Card.Body className="text-center p-4">
                        <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ 
                          width: 60, 
                          height: 60, 
                          background: 'rgba(13,110,253,0.1)',
                          color: '#0d6efd'
                        }}>
                          <i className="fas fa-home" style={{ fontSize: '1.8rem' }}></i>
                        </div>
                        <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Dashboard</h6>
                        <Button 
                          variant={hasPrivilege('View Reports') ? "primary" : "light"}
                          size="sm" 
                          className="w-100 rounded-3 fw-semibold"
                          disabled={!hasPrivilege('View Reports')}
                        >
                          {hasPrivilege('View Reports') ? 'Access' : 'No Access'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm h-100 hover-card" style={{ transition: 'all 0.3s ease' }}>
                      <Card.Body className="text-center p-4">
                        <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ 
                          width: 60, 
                          height: 60, 
                          background: 'rgba(255,193,7,0.1)',
                          color: '#ffc107'
                        }}>
                          <i className="fas fa-broadcast-tower" style={{ fontSize: '1.8rem' }}></i>
                        </div>
                        <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Command Center</h6>
                        <Button 
                          variant={hasPrivilege('Access Command Center') ? "warning" : "light"}
                          size="sm" 
                          className="w-100 rounded-3 fw-semibold"
                          disabled={!hasPrivilege('Access Command Center')}
                        >
                          {hasPrivilege('Access Command Center') ? 'Access' : 'No Access'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm h-100 hover-card" style={{ transition: 'all 0.3s ease' }}>
                      <Card.Body className="text-center p-4">
                        <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ 
                          width: 60, 
                          height: 60, 
                          background: 'rgba(25,135,84,0.1)',
                          color: '#198754'
                        }}>
                          <i className="fas fa-chart-line" style={{ fontSize: '1.8rem' }}></i>
                        </div>
                        <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Reports</h6>
                        <Button 
                          variant={hasPrivilege('View Reports') ? "success" : "light"}
                          size="sm" 
                          className="w-100 rounded-3 fw-semibold"
                          disabled={!hasPrivilege('View Reports')}
                        >
                          {hasPrivilege('View Reports') ? 'Access' : 'No Access'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm h-100 hover-card" style={{ transition: 'all 0.3s ease' }}>
                      <Card.Body className="text-center p-4">
                        <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ 
                          width: 60, 
                          height: 60, 
                          background: 'rgba(108,117,125,0.1)',
                          color: '#6c757d'
                        }}>
                          <i className="fas fa-cog" style={{ fontSize: '1.8rem' }}></i>
                        </div>
                        <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Settings</h6>
                        <Button 
                          variant={hasPrivilege('System Settings') ? "secondary" : "light"}
                          size="sm" 
                          className="w-100 rounded-3 fw-semibold"
                          disabled={!hasPrivilege('System Settings')}
                        >
                          {hasPrivilege('System Settings') ? 'Access' : 'No Access'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Statistics Card */}
          <Col xs={12}>
            <Card className="shadow-sm border-0 rounded-4" style={{ width: '100%', minHeight: '100vh', margin: 0, borderRadius: 0 }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{ 
                    width: 48, 
                    height: 48, 
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    color: '#2c3e50'
                  }}>
                    <i className="fas fa-chart-bar" style={{ fontSize: '1.3rem' }}></i>
                  </div>
                  <h3 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>System Overview</h3>
                </div>
                <Row className="g-4">
                  <Col xs={12} sm={6} md={3}>
                    <div className="text-center p-3 rounded-3" style={{ background: 'rgba(13,110,253,0.1)', color: '#0d6efd' }}>
                      <i className="fas fa-users fa-2x mb-2 opacity-75"></i>
                      <h4 className="fw-bold mb-1">Active Users</h4>
                      <p className="mb-0 opacity-75">24</p>
                    </div>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <div className="text-center p-3 rounded-3" style={{ background: 'rgba(255,193,7,0.1)', color: '#ffc107' }}>
                      <i className="fas fa-shield-alt fa-2x mb-2 opacity-75"></i>
                      <h4 className="fw-bold mb-1">Patrols</h4>
                      <p className="mb-0 opacity-75">12</p>
                    </div>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <div className="text-center p-3 rounded-3" style={{ background: 'rgba(220,53,69,0.1)', color: '#dc3545' }}>
                      <i className="fas fa-exclamation-triangle fa-2x mb-2 opacity-75"></i>
                      <h4 className="fw-bold mb-1">Incidents</h4>
                      <p className="mb-0 opacity-75">3</p>
                    </div>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <div className="text-center p-3 rounded-3" style={{ background: 'rgba(25,135,84,0.1)', color: '#198754' }}>
                      <i className="fas fa-check-circle fa-2x mb-2 opacity-75"></i>
                      <h4 className="fw-bold mb-1">Resolved</h4>
                      <p className="mb-0 opacity-75">18</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default UserDashboard; 