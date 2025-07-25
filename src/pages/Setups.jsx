import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Container, Card, Row, Col, Stack, Button, Form } from 'react-bootstrap';

function Setups() {
  // Demo state for settings
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saveStatusAdvanced, setSaveStatusAdvanced] = useState('');

  const [defaultView, setDefaultView] = useState('dashboard');
  const [maxPatrollers, setMaxPatrollers] = useState(10);
  const [incidentSeverity, setIncidentSeverity] = useState('all');
  const [checkinInterval, setCheckinInterval] = useState(30);
  const [saveStatusConfig, setSaveStatusConfig] = useState('');

  const handleSaveAdvanced = (e) => {
    e.preventDefault();
    setSaveStatusAdvanced('Saving...');
    setTimeout(() => {
      setSaveStatusAdvanced('Settings saved!');
      setTimeout(() => setSaveStatusAdvanced(''), 2000);
    }, 1000);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setSaveStatusConfig('Saving...');
    setTimeout(() => {
      setSaveStatusConfig('Settings saved!');
      setTimeout(() => setSaveStatusConfig(''), 2000);
    }, 1000);
  };

  return (
    <DashboardLayout activePage="setups">
      <Container fluid className="py-4 px-2 px-md-4" style={{ minHeight: '100vh' }}>
        <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light bg-opacity-75 p-4">
          <Stack direction="horizontal" gap={3} className="align-items-center flex-wrap">
            <div className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
              <i className="fas fa-cogs text-success" style={{ fontSize: '1.7rem' }}></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0" style={{ fontSize: '1.6rem', letterSpacing: '0.5px' }}>Setups</h2>
              <p className="text-muted mb-0" style={{ fontSize: '1.05rem' }}>Configure system settings and modules</p>
            </div>
          </Stack>
        </Card>
        <Row className="g-4 justify-content-center">
          {/* Advanced Setups Tile */}
          <Col xs={12} lg={6} className="d-flex">
            <Card className="shadow-sm h-100 flex-fill border-0 rounded-4">
              <Card.Body className="p-4">
                <Stack direction="horizontal" gap={2} className="align-items-center mb-3">
                  <i className="fas fa-sliders-h text-primary" style={{ fontSize: '1.3rem' }}></i>
                  <h3 className="fw-bold mb-0 text-primary">Advanced Setups</h3>
                </Stack>
                <Form onSubmit={handleSaveAdvanced}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Enable Advanced Feature</Form.Label>
                    <Form.Check
                      type="switch"
                      id="featureEnabled"
                      label={featureEnabled ? 'Enabled' : 'Disabled'}
                      checked={featureEnabled}
                      onChange={e => setFeatureEnabled(e.target.checked)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Enable Maintenance Mode</Form.Label>
                    <Form.Check
                      type="switch"
                      id="maintenanceMode"
                      label={maintenanceMode ? 'Enabled' : 'Disabled'}
                      checked={maintenanceMode}
                      onChange={e => setMaintenanceMode(e.target.checked)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Enable Notifications</Form.Label>
                    <Form.Check
                      type="switch"
                      id="notificationsEnabled"
                      label={notificationsEnabled ? 'Enabled' : 'Disabled'}
                      checked={notificationsEnabled}
                      onChange={e => setNotificationsEnabled(e.target.checked)}
                    />
                  </Form.Group>
                  <div className="d-grid gap-2 d-md-block">
                    <Button type="submit" variant="primary" className="px-4 fw-bold">Save Advanced</Button>
                  </div>
                  {saveStatusAdvanced && <span className="ms-3 text-success fw-semibold">{saveStatusAdvanced}</span>}
                </Form>
              </Card.Body>
            </Card>
          </Col>
          {/* Configuration Options Tile */}
          <Col xs={12} lg={6} className="d-flex">
            <Card className="shadow-sm h-100 flex-fill border-0 rounded-4">
              <Card.Body className="p-4">
                <Stack direction="horizontal" gap={2} className="align-items-center mb-3">
                  <i className="fas fa-cog text-success" style={{ fontSize: '1.3rem' }}></i>
                  <h3 className="fw-bold mb-0 text-success">Configuration Options</h3>
                </Stack>
                <Form onSubmit={handleSaveConfig}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold" htmlFor="defaultView">Default Dashboard View</Form.Label>
                    <Form.Select
                      id="defaultView"
                      value={defaultView}
                      onChange={e => setDefaultView(e.target.value)}
                    >
                      <option value="dashboard">Dashboard</option>
                      <option value="reports">Reports</option>
                      <option value="users">Users</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold" htmlFor="incidentSeverity">Default Incident Severity Filter</Form.Label>
                    <Form.Select
                      id="incidentSeverity"
                      value={incidentSeverity}
                      onChange={e => setIncidentSeverity(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold" htmlFor="maxPatrollers">Max Active Patrollers</Form.Label>
                    <Form.Control
                      type="number"
                      id="maxPatrollers"
                      min={1}
                      value={maxPatrollers}
                      onChange={e => setMaxPatrollers(Number(e.target.value))}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold" htmlFor="checkinInterval">Patroller Check-in Interval (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      id="checkinInterval"
                      min={1}
                      value={checkinInterval}
                      onChange={e => setCheckinInterval(Number(e.target.value))}
                    />
                  </Form.Group>
                  <div className="d-grid gap-2 d-md-block">
                    <Button type="submit" variant="success" className="px-4 fw-bold">Save Config</Button>
                  </div>
                  {saveStatusConfig && <span className="ms-3 text-success fw-semibold">{saveStatusConfig}</span>}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}

export default Setups; 