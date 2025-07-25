import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

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
    <div style={{ height: '100%', minHeight: '100vh', width: '100%', minWidth: '100vw', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      <DashboardLayout activePage="setups">
        <div className="bg-white shadow-sm rounded-4 p-4 mb-4">
          <h2 className="fw-bold mb-0">Setups</h2>
          <p className="text-muted mb-0">Configure system settings and modules</p>
        </div>
        <div className="row g-4 justify-content-center">
          {/* Advanced Setups Tile */}
          <div className="col-12 col-lg-6 d-flex">
            <div className="card shadow-sm h-100 flex-fill">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3 text-primary">Advanced Setups</h3>
                <form onSubmit={handleSaveAdvanced}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Enable Advanced Feature</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="featureEnabled"
                        checked={featureEnabled}
                        onChange={e => setFeatureEnabled(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="featureEnabled">
                        {featureEnabled ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Enable Maintenance Mode</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="maintenanceMode"
                        checked={maintenanceMode}
                        onChange={e => setMaintenanceMode(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="maintenanceMode">
                        {maintenanceMode ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Enable Notifications</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notificationsEnabled"
                        checked={notificationsEnabled}
                        onChange={e => setNotificationsEnabled(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="notificationsEnabled">
                        {notificationsEnabled ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Save Advanced</button>
                  {saveStatusAdvanced && <span className="ms-3 text-success fw-semibold">{saveStatusAdvanced}</span>}
                </form>
              </div>
            </div>
          </div>
          {/* Configuration Options Tile */}
          <div className="col-12 col-lg-6 d-flex">
            <div className="card shadow-sm h-100 flex-fill">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-3 text-success">Configuration Options</h3>
                <form onSubmit={handleSaveConfig}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" htmlFor="defaultView">Default Dashboard View</label>
                    <select
                      className="form-select"
                      id="defaultView"
                      value={defaultView}
                      onChange={e => setDefaultView(e.target.value)}
                    >
                      <option value="dashboard">Dashboard</option>
                      <option value="reports">Reports</option>
                      <option value="users">Users</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" htmlFor="incidentSeverity">Default Incident Severity Filter</label>
                    <select
                      className="form-select"
                      id="incidentSeverity"
                      value={incidentSeverity}
                      onChange={e => setIncidentSeverity(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                <div className="mb-4">
                    <label className="form-label fw-semibold" htmlFor="maxPatrollers">Max Active Patrollers</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxPatrollers"
                      min={1}
                      value={maxPatrollers}
                      onChange={e => setMaxPatrollers(Number(e.target.value))}
                    />
                </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" htmlFor="checkinInterval">Patroller Check-in Interval (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="checkinInterval"
                      min={1}
                      value={checkinInterval}
                      onChange={e => setCheckinInterval(Number(e.target.value))}
                    />
                </div>
                  <button type="submit" className="btn btn-success px-4 fw-bold">Save Config</button>
                  {saveStatusConfig && <span className="ms-3 text-success fw-semibold">{saveStatusConfig}</span>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}

export default Setups; 