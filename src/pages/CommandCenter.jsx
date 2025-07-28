import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Stack } from 'react-bootstrap';
import SectionHeader from '../components/SectionHeader';

function CommandCenter() {
  return (
    <DashboardLayout activePage="command-center">
      <div className="page-container">
        {/* Header */}
        <SectionHeader icon="fa-broadcast-tower" title="Command Center" subtitle="Centralized command and monitoring" />

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