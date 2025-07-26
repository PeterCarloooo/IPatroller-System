import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Stack, Badge, Form, Switch } from 'react-bootstrap';
import ChangePasswordTest from './ChangePasswordTest';

function Settings() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
      systemAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginNotifications: true,
      passwordExpiry: 90
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false,
      showAnimations: true
    },
    privacy: {
      dataCollection: true,
      analytics: false,
      locationSharing: false,
      profileVisibility: 'public'
    }
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const settingsCards = [
    {
      id: 'password',
      title: 'Change Password',
      description: 'Update your account password for enhanced security',
      icon: 'fas fa-key',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      action: () => setShowChangePassword(true),
      badge: 'Security',
      features: ['Password strength validation', 'Two-factor authentication', 'Session management']
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage how you receive alerts and updates',
      icon: 'fas fa-bell',
      color: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
      badge: 'Communication',
      features: ['Email notifications', 'Push alerts', 'SMS notifications', 'System alerts']
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Configure security and privacy preferences',
      icon: 'fas fa-shield-alt',
      color: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      badge: 'Protection',
      features: ['Two-factor authentication', 'Session timeout', 'Login notifications', 'Password expiry']
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the interface and visual preferences',
      icon: 'fas fa-palette',
      color: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
      badge: 'Customization',
      features: ['Theme selection', 'Font size', 'Compact mode', 'Animations']
    },
    {
      id: 'language',
      title: 'Language & Region',
      description: 'Set your preferred language and regional settings',
      icon: 'fas fa-language',
      color: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
      badge: 'Localization',
      features: ['Language selection', 'Regional format', 'Time zone', 'Currency']
    },
    {
      id: 'support',
      title: 'Help & Support',
      description: 'Get assistance and access support resources',
      icon: 'fas fa-question-circle',
      color: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
      badge: 'Assistance',
      features: ['Documentation', 'Contact support', 'FAQ', 'Tutorials']
    }
  ];

  return (
    <DashboardLayout activePage="settings">
      <div className="settings-container">
        {/* Enhanced Header */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle" style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              <i className="fas fa-cog text-white fs-4"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-1">Settings</h4>
              <p className="text-muted mb-0">Manage your account preferences and system configuration</p>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <Row className="g-4 mb-4">
          {settingsCards.map((card) => (
            <Col xs={12} sm={6} lg={4} key={card.id}>
              <Card 
                className="settings-card border-0 shadow-sm h-100" 
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  cursor: card.action ? 'pointer' : 'default',
                  transition: 'all 0.3s ease'
                }}
                onClick={card.action}
                onMouseEnter={(e) => {
                  if (card.action) {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (card.action) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                <Card.Body className="p-4 text-center">
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{
                      width: 64,
                      height: 64,
                      background: card.color,
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
                    }}>
                      <i className={`${card.icon} text-white fs-3`}></i>
                    </div>
                    <Badge 
                      bg="light" 
                      className="rounded-pill mb-2"
                      style={{ 
                        color: '#667eea', 
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      {card.badge}
                    </Badge>
                  </div>
                  
                  <h5 className="fw-bold mb-2">{card.title}</h5>
                  <p className="text-muted mb-3 small">{card.description}</p>
                  
                  <div className="features-list">
                    {card.features.map((feature, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 mb-1">
                        <i className="fas fa-check text-success" style={{ fontSize: '0.7rem' }}></i>
                        <small className="text-muted">{feature}</small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Settings Section */}
        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
                    boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)'
                  }}>
                    <i className="fas fa-sliders-h text-white"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Quick Settings</h5>
                    <p className="text-muted mb-0">Common settings you can adjust quickly</p>
                  </div>
                </div>
                
                <Row className="g-3">
                  <Col md={6}>
                    <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(102, 126, 234, 0.05)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h6 className="fw-semibold mb-1">Email Notifications</h6>
                          <small className="text-muted">Receive updates via email</small>
                        </div>
                        <Form.Check 
                          type="switch"
                          checked={settings.notifications.email}
                          onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                        />
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.05)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h6 className="fw-semibold mb-1">Two-Factor Auth</h6>
                          <small className="text-muted">Enhanced security protection</small>
                        </div>
                        <Form.Check 
                          type="switch"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                        />
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.05)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h6 className="fw-semibold mb-1">Push Notifications</h6>
                          <small className="text-muted">Real-time alerts</small>
                        </div>
                        <Form.Check 
                          type="switch"
                          checked={settings.notifications.push}
                          onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                        />
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(23, 162, 184, 0.05)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h6 className="fw-semibold mb-1">Show Animations</h6>
                          <small className="text-muted">Interface animations</small>
                        </div>
                        <Form.Check 
                          type="switch"
                          checked={settings.appearance.showAnimations}
                          onChange={(e) => handleSettingChange('appearance', 'showAnimations', e.target.checked)}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
                    boxShadow: '0 4px 15px rgba(111, 66, 193, 0.3)'
                  }}>
                    <i className="fas fa-info-circle text-white"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">System Info</h5>
                    <p className="text-muted mb-0">Current system status</p>
                  </div>
                </div>
                
                <div className="system-info">
                  <div className="d-flex justify-content-between align-items-center p-2 mb-2 rounded-3" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                    <small className="fw-semibold">Last Login</small>
                    <small className="text-muted">Today, 9:30 AM</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-2 mb-2 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                    <small className="fw-semibold">Session Time</small>
                    <small className="text-muted">2 hours 15 min</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-2 mb-2 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                    <small className="fw-semibold">Active Features</small>
                    <small className="text-muted">8/12 enabled</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                    <small className="fw-semibold">System Status</small>
                    <Badge bg="success" className="rounded-pill">
                      <i className="fas fa-check me-1"></i>
                      Online
                    </Badge>
                  </div>
                </div>
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