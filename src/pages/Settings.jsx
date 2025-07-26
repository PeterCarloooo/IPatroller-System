import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Stack } from 'react-bootstrap';
import ChangePasswordTest from './ChangePasswordTest';

function Settings() {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <DashboardLayout activePage="settings">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-cog text-primary fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Settings</h2>
            <p className="text-muted mb-0 small">Manage your account and system preferences</p>
          </div>
        </div>

        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 border-0 rounded-3" role="button" onClick={() => setShowChangePassword(true)}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-key text-primary fs-1"></i>
                </div>
                <h4 className="fw-bold mb-2 text-center fs-5">Change Password</h4>
                <p className="text-muted text-center mb-0 small">Update your account password</p>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 border-0 rounded-3">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-bell text-warning fs-1"></i>
                </div>
                <h4 className="fw-bold mb-2 text-center fs-5">Notifications</h4>
                <p className="text-muted text-center mb-0 small">Manage notification preferences</p>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 border-0 rounded-3">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-shield-alt text-success fs-1"></i>
                </div>
                <h4 className="fw-bold mb-2 text-center fs-5">Security</h4>
                <p className="text-muted text-center mb-0 small">Security and privacy settings</p>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 border-0 rounded-3">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-palette text-info fs-1"></i>
                </div>
                <h4 className="fw-bold mb-2 text-center fs-5">Appearance</h4>
                <p className="text-muted text-center mb-0 small">Customize the interface</p>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 border-0 rounded-3">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-language text-secondary fs-1"></i>
                </div>
                <h4 className="fw-bold mb-2 text-center fs-5">Language</h4>
                <p className="text-muted text-center mb-0 small">Change system language</p>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 border-0 rounded-3">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-question-circle text-primary fs-1"></i>
                </div>
                <h4 className="fw-bold mb-2 text-center fs-5">Help & Support</h4>
                <p className="text-muted text-center mb-0 small">Get help and support</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <ChangePasswordTest isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
      </div>
    </DashboardLayout>
  );
}

export default Settings; 