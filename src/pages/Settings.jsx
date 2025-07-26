import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Stack, Badge, Form, Switch, Modal, Alert } from 'react-bootstrap';
import ChangePasswordTest from './ChangePasswordTest';

function Settings() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
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
      action: () => setShowNotifications(true),
      badge: 'Communication',
      features: ['Email notifications', 'Push alerts', 'SMS notifications', 'System alerts']
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Configure security and privacy preferences',
      icon: 'fas fa-shield-alt',
      color: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      action: () => setShowSecurity(true),
      badge: 'Protection',
      features: ['Two-factor authentication', 'Session timeout', 'Login notifications', 'Password expiry']
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the interface and visual preferences',
      icon: 'fas fa-palette',
      color: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
      action: () => setShowAppearance(true),
      badge: 'Customization',
      features: ['Theme selection', 'Font size', 'Compact mode', 'Animations']
    },
    {
      id: 'language',
      title: 'Language & Region',
      description: 'Set your preferred language and regional settings',
      icon: 'fas fa-language',
      color: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
      action: () => setShowLanguage(true),
      badge: 'Localization',
      features: ['Language selection', 'Regional format', 'Time zone', 'Currency']
    },
    {
      id: 'support',
      title: 'Help & Support',
      description: 'Get assistance and access support resources',
      icon: 'fas fa-question-circle',
      color: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
      action: () => setShowSupport(true),
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
        
        {/* Notifications Modal */}
        <Modal show={showNotifications} onHide={() => setShowNotifications(false)} size="lg" centered>
          <Modal.Header closeButton style={{ border: 'none', background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)' }}>
            <Modal.Title className="text-white">
              <i className="fas fa-bell me-2"></i>
              Notification Settings
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center">
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
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-semibold mb-1">Push Notifications</h6>
                      <small className="text-muted">Real-time browser alerts</small>
                    </div>
                    <Form.Check 
                      type="switch"
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-semibold mb-1">SMS Notifications</h6>
                      <small className="text-muted">Text message alerts</small>
                    </div>
                    <Form.Check 
                      type="switch"
                      checked={settings.notifications.sms}
                      onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-semibold mb-1">System Alerts</h6>
                      <small className="text-muted">Important system messages</small>
                    </div>
                    <Form.Check 
                      type="switch"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ border: 'none' }}>
            <Button variant="secondary" onClick={() => setShowNotifications(false)}>
              Close
            </Button>
            <Button variant="warning" onClick={() => setShowNotifications(false)}>
              <i className="fas fa-save me-2"></i>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Security Settings Modal */}
        <Modal show={showSecurity} onHide={() => setShowSecurity(false)} size="lg" centered>
          <Modal.Header closeButton style={{ border: 'none', background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
            <Modal.Title className="text-white">
              <i className="fas fa-shield-alt me-2"></i>
              Security Settings
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-semibold mb-1">Two-Factor Authentication</h6>
                      <small className="text-muted">Enhanced security protection</small>
                    </div>
                    <Form.Check 
                      type="switch"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-semibold mb-1">Login Notifications</h6>
                      <small className="text-muted">Alert on new logins</small>
                    </div>
                    <Form.Check 
                      type="switch"
                      checked={settings.security.loginNotifications}
                      onChange={(e) => handleSettingChange('security', 'loginNotifications', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                  <div>
                    <h6 className="fw-semibold mb-2">Session Timeout (minutes)</h6>
                    <Form.Select 
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                  <div>
                    <h6 className="fw-semibold mb-2">Password Expiry (days)</h6>
                    <Form.Select 
                      value={settings.security.passwordExpiry}
                      onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                    >
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ border: 'none' }}>
            <Button variant="secondary" onClick={() => setShowSecurity(false)}>
              Close
            </Button>
            <Button variant="success" onClick={() => setShowSecurity(false)}>
              <i className="fas fa-save me-2"></i>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Appearance Settings Modal */}
        <Modal show={showAppearance} onHide={() => setShowAppearance(false)} size="lg" centered>
          <Modal.Header closeButton style={{ border: 'none', background: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)' }}>
            <Modal.Title className="text-white">
              <i className="fas fa-palette me-2"></i>
              Appearance Settings
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                  <div>
                    <h6 className="fw-semibold mb-2">Theme</h6>
                    <Form.Select 
                      value={settings.appearance.theme}
                      onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                    >
                      <option value="light">Light Theme</option>
                      <option value="dark">Dark Theme</option>
                      <option value="auto">Auto (System)</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                  <div>
                    <h6 className="fw-semibold mb-2">Font Size</h6>
                    <Form.Select 
                      value={settings.appearance.fontSize}
                      onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-semibold mb-1">Compact Mode</h6>
                      <small className="text-muted">Reduced spacing</small>
                    </div>
                    <Form.Check 
                      type="switch"
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center">
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
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ border: 'none' }}>
            <Button variant="secondary" onClick={() => setShowAppearance(false)}>
              Close
            </Button>
            <Button variant="info" onClick={() => setShowAppearance(false)}>
              <i className="fas fa-save me-2"></i>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Language Settings Modal */}
        <Modal show={showLanguage} onHide={() => setShowLanguage(false)} size="lg" centered>
          <Modal.Header closeButton style={{ border: 'none', background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)' }}>
            <Modal.Title className="text-white">
              <i className="fas fa-language me-2"></i>
              Language & Region Settings
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(111, 66, 193, 0.1)' }}>
                  <div>
                    <h6 className="fw-semibold mb-2">Language</h6>
                    <Form.Select>
                      <option value="en">English</option>
                      <option value="tl">Tagalog</option>
                      <option value="es">Spanish</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(111, 66, 193, 0.1)' }}>
                  <div>
                    <h6 className="fw-semibold mb-2">Time Zone</h6>
                    <Form.Select>
                      <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(111, 66, 193, 0.1)' }}>
                  <div>
                    <h6 className="fw-semibold mb-2">Date Format</h6>
                    <Form.Select>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(111, 66, 193, 0.1)' }}>
                  <div>
                    <h6 className="fw-semibold mb-2">Currency</h6>
                    <Form.Select>
                      <option value="PHP">Philippine Peso (₱)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ border: 'none' }}>
            <Button variant="secondary" onClick={() => setShowLanguage(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setShowLanguage(false)}>
              <i className="fas fa-save me-2"></i>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Support Modal */}
        <Modal show={showSupport} onHide={() => setShowSupport(false)} size="lg" centered>
          <Modal.Header closeButton style={{ border: 'none', background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' }}>
            <Modal.Title className="text-white">
              <i className="fas fa-question-circle me-2"></i>
              Help & Support
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(108, 117, 125, 0.1)' }}>
                  <div className="text-center">
                    <i className="fas fa-book text-primary fs-2 mb-3"></i>
                    <h6 className="fw-semibold mb-2">Documentation</h6>
                    <p className="text-muted small mb-3">User guides and tutorials</p>
                    <Button variant="outline-primary" size="sm">
                      <i className="fas fa-external-link-alt me-2"></i>
                      View Docs
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(108, 117, 125, 0.1)' }}>
                  <div className="text-center">
                    <i className="fas fa-headset text-success fs-2 mb-3"></i>
                    <h6 className="fw-semibold mb-2">Contact Support</h6>
                    <p className="text-muted small mb-3">Get help from our team</p>
                    <Button variant="outline-success" size="sm">
                      <i className="fas fa-envelope me-2"></i>
                      Contact Us
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(108, 117, 125, 0.1)' }}>
                  <div className="text-center">
                    <i className="fas fa-question text-warning fs-2 mb-3"></i>
                    <h6 className="fw-semibold mb-2">FAQ</h6>
                    <p className="text-muted small mb-3">Frequently asked questions</p>
                    <Button variant="outline-warning" size="sm">
                      <i className="fas fa-search me-2"></i>
                      Browse FAQ
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="setting-item p-3 rounded-3" style={{ background: 'rgba(108, 117, 125, 0.1)' }}>
                  <div className="text-center">
                    <i className="fas fa-play-circle text-info fs-2 mb-3"></i>
                    <h6 className="fw-semibold mb-2">Video Tutorials</h6>
                    <p className="text-muted small mb-3">Step-by-step guides</p>
                    <Button variant="outline-info" size="sm">
                      <i className="fas fa-video me-2"></i>
                      Watch Videos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ border: 'none' }}>
            <Button variant="secondary" onClick={() => setShowSupport(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default Settings; 