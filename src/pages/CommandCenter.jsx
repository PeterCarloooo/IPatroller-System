import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Stack } from 'react-bootstrap';

function CommandCenter() {
  return (
    <DashboardLayout activePage="command-center">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-broadcast-tower text-primary fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Command Center</h2>
            <p className="text-muted mb-0 small">Centralized command and monitoring</p>
          </div>
        </div>

        <Card className="shadow-sm border-0 rounded-3">
          <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-5">
            <div className="mb-4">
              <i className="fas fa-broadcast-tower text-primary fs-1" style={{ opacity: 0.8 }}></i>
            </div>
            <h3 className="fw-bold mb-3">Coming Soon!</h3>
            <p className="text-muted text-center mb-4" style={{ maxWidth: '600px' }}>
              We're working hard to bring you a powerful command center for real-time operations.
            </p>
            <div className="d-flex justify-content-center align-items-center text-primary">
              <i className="fas fa-clock me-2"></i>
              <span>Feature Under Development</span>
            </div>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default CommandCenter; 