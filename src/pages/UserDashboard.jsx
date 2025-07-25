import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Container, Card, Stack } from 'react-bootstrap';

function UserDashboard() {
  return (
    <DashboardLayout activePage="dashboard">
      <Container fluid className="py-4 px-2 px-md-4">
        <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light bg-opacity-75">
          <Card.Body>
            <Stack direction="horizontal" gap={3} className="align-items-center flex-wrap mb-3">
              <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 72, height: 72 }}>
                <i className="fas fa-user text-primary" style={{ fontSize: '2.2rem' }}></i>
              </div>
              <div>
                <h2 className="fw-bold mb-1" style={{ fontSize: '2rem', letterSpacing: '0.5px' }}>Welcome, User!</h2>
                <p className="text-muted mb-3" style={{ fontSize: '1.1rem' }}>This is your limited dashboard. Please contact your administrator if you need more access.</p>
              </div>
            </Stack>
            <Card className="shadow-sm border-0 rounded-4 bg-white mt-4">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-5">
                <div className="mb-4">
                  <i className="fas fa-user text-primary fa-4x" style={{ opacity: 0.8 }}></i>
                </div>
                <h3 className="fw-bold mb-3">Welcome to the iPatroller System</h3>
                <p className="text-muted text-center mb-4" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
                  Here you can view your assigned patrols, receive updates, and access important information. If you need additional features or permissions, please contact your system administrator.
                </p>
                <div className="d-flex justify-content-center align-items-center text-primary">
                  <i className="fas fa-info-circle me-2" />
                  <span>Dashboard access only</span>
                </div>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </Container>
    </DashboardLayout>
  );
}

export default UserDashboard; 