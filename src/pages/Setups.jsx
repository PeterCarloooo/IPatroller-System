import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Table, Badge, Stack, Form, Nav, Spinner, Modal } from 'react-bootstrap';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc, setDoc, query, where, writeBatch } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useIPatrollerData } from '../context/IPatrollerContext';

function Setups() {
  const [activeTab, setActiveTab] = useState('municipalities');
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState({
    general: {
      systemName: 'IPatroller System',
      defaultLanguage: 'en',
      enableNotifications: true,
      timezone: 'Asia/Manila'
    },
    security: {
      sessionTimeout: 30,
      enable2FA: false,
      enableAuditLogging: true,
      passwordPolicy: 'medium'
    },
    ipatroller: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 90,
      enableDataValidation: true
    }
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMunicipality, setEditingMunicipality] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    status: 'Active',
    privileges: []
  });
  const [usersInMunicipality, setUsersInMunicipality] = useState([]);
  const { allData } = useIPatrollerData();

  // Available privileges
  const availablePrivileges = [
    'View Reports',
    'Manage Users', 
    'Access Command Center',
    'Export Data',
    'Manage Incidents',
    'View Analytics',
    'System Settings',
    'User Management'
  ];

  // Default municipalities data - Connected to IPatroller system municipalities
  const defaultMunicipalities = [
    { id: 1, name: 'ABUCAY', status: 'Active', privileges: ['View Reports', 'Manage Users', 'Access Command Center'], lastUpdated: '2024-01-15' },
    { id: 2, name: 'ORANI', status: 'Active', privileges: ['View Reports', 'Access Command Center'], lastUpdated: '2024-01-14' },
    { id: 3, name: 'SAMAL', status: 'Active', privileges: ['View Reports'], lastUpdated: '2024-01-10' },
    { id: 4, name: 'HERMOSA', status: 'Active', privileges: ['View Reports', 'Manage Users', 'Access Command Center', 'Export Data'], lastUpdated: '2024-01-12' },
    { id: 5, name: 'BALANGA', status: 'Active', privileges: ['View Reports', 'Access Command Center'], lastUpdated: '2024-01-13' },
    { id: 6, name: 'PILAR', status: 'Active', privileges: ['View Reports'], lastUpdated: '2024-01-08' },
    { id: 7, name: 'ORION', status: 'Active', privileges: ['View Reports', 'Manage Users'], lastUpdated: '2024-01-11' },
    { id: 8, name: 'LIMAY', status: 'Active', privileges: ['View Reports', 'Access Command Center'], lastUpdated: '2024-01-09' },
    { id: 9, name: 'BAGAC', status: 'Active', privileges: ['View Reports'], lastUpdated: '2024-01-07' },
    { id: 10, name: 'DINALUPIHAN', status: 'Active', privileges: ['View Reports', 'Access Command Center'], lastUpdated: '2024-01-06' },
    { id: 11, name: 'MARIVELES', status: 'Active', privileges: ['View Reports', 'Manage Users'], lastUpdated: '2024-01-05' },
    { id: 12, name: 'MORONG', status: 'Active', privileges: ['View Reports', 'Access Command Center'], lastUpdated: '2024-01-04' }
  ];

  // Load municipalities from Firebase
  useEffect(() => {
    const loadMunicipalities = async () => {
      try {
        console.log('🔍 Loading municipalities from Firebase...');
        const querySnapshot = await getDocs(collection(db, 'municipality_privileges'));
        const muniData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('📊 Loaded municipalities:', muniData);
        setMunicipalities(muniData.length > 0 ? muniData : defaultMunicipalities);
        console.log('✅ Municipalities state set:', muniData.length > 0 ? muniData : defaultMunicipalities);
      } catch (error) {
        console.error('❌ Error loading municipalities:', error);
        setMunicipalities(defaultMunicipalities);
      } finally {
        setLoading(false);
      }
    };
    loadMunicipalities();
  }, []);

  // Load system settings on component mount
  useEffect(() => {
    loadSystemSettings();
  }, []);

  const handleStatusToggle = async (municipalityId) => {
    const updatedMunicipalities = municipalities.map(muni => 
      muni.id === municipalityId 
        ? { ...muni, status: muni.status === 'Active' ? 'Inactive' : 'Active' }
        : muni
    );
    setMunicipalities(updatedMunicipalities);
    
    // Save to Firebase
    try {
      const muniRef = doc(db, 'municipality_privileges', municipalityId.toString());
      await updateDoc(muniRef, {
        status: updatedMunicipalities.find(m => m.id === municipalityId).status,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error updating municipality status:', error);
    }
  };

  // Load users for a specific municipality
  const loadUsersInMunicipality = async (municipalityName) => {
    try {
      const usersQuery = query(collection(db, 'users'), where('municipality', '==', municipalityName));
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsersInMunicipality(users);
      console.log(`👥 Loaded ${users.length} users for municipality: ${municipalityName}`);
    } catch (error) {
      console.error('Error loading users for municipality:', error);
      setUsersInMunicipality([]);
    }
  };

  const handleEditPrivileges = async (municipality) => {
    console.log('🔘 Edit button clicked for municipality:', municipality);
    
    if (municipality) {
      console.log('🎯 Setting up edit form for:', municipality.name);
      
      setEditingMunicipality(municipality);
      setEditForm({
        name: municipality.name,
        status: municipality.status,
        privileges: [...(municipality.privileges || [])]
      });
      
      // Load users for this municipality
      await loadUsersInMunicipality(municipality.name);
      
      setShowEditModal(true);
      console.log('✅ Modal opened successfully');
    } else {
      console.error('❌ Municipality not found');
      alert('Municipality not found!');
    }
  };

  const closeEditModal = () => {
    console.log('🚪 Closing edit modal');
    setShowEditModal(false);
    setEditingMunicipality(null);
    setEditForm({
      name: '',
      status: 'Active',
      privileges: []
    });
    setUsersInMunicipality([]);
  };

  const saveEditChanges = async () => {
    if (!editingMunicipality) {
      alert('No municipality selected for editing');
      return;
    }

    console.log('💾 Saving changes for:', editingMunicipality.name);
    console.log('📝 Form data:', editForm);

    try {
      // Update local state
      const updatedMunicipalities = municipalities.map(muni =>
        muni.id === editingMunicipality.id
          ? { ...muni, ...editForm, lastUpdated: new Date().toISOString().split('T')[0] }
          : muni
      );
      setMunicipalities(updatedMunicipalities);

      // Save to Firebase
      const muniRef = doc(db, 'municipality_privileges', editingMunicipality.id.toString());
      await setDoc(muniRef, {
        id: editingMunicipality.id,
        name: editForm.name,
        status: editForm.status,
        privileges: editForm.privileges,
        lastUpdated: new Date().toISOString().split('T')[0]
      });

      // Update users' privileges if municipality name changed
      if (editingMunicipality.name !== editForm.name) {
        const usersQuery = query(collection(db, 'users'), where('municipality', '==', editingMunicipality.name));
        const usersSnapshot = await getDocs(usersQuery);
        
        const batch = writeBatch(db);
        usersSnapshot.docs.forEach(userDoc => {
          batch.update(userDoc.ref, { municipality: editForm.name });
        });
        await batch.commit();
        console.log(`🔄 Updated ${usersSnapshot.docs.length} users' municipality to: ${editForm.name}`);
      }

      closeEditModal();
      alert('Municipality privileges updated successfully!');
    } catch (error) {
      console.error('❌ Error saving changes:', error);
      alert('Error updating privileges. Please try again.');
    }
  };

  // Check if municipality has IPatroller data
  const hasIPatrollerData = (municipalityName) => {
    for (const monthKey in allData) {
      const monthData = allData[monthKey];
      if (monthData && monthData[municipalityName]) {
        // Check if there's any non-empty data
        const hasData = monthData[municipalityName].some(count => count !== '' && count !== null && count !== undefined);
        if (hasData) return true;
      }
    }
    return false;
  };

  // Get IPatroller data summary for municipality
  const getIPatrollerDataSummary = (municipalityName) => {
    let totalMonths = 0;
    let totalDays = 0;
    
    for (const monthKey in allData) {
      const monthData = allData[monthKey];
      if (monthData && monthData[municipalityName]) {
        totalMonths++;
        const filledDays = monthData[municipalityName].filter(count => count !== '' && count !== null && count !== undefined).length;
        totalDays += filledDays;
      }
    }
    
    return { totalMonths, totalDays };
  };

  // Load system settings from Firebase
  const loadSystemSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'system_settings', 'main'));
      if (settingsDoc.exists()) {
        const loadedSettings = settingsDoc.data();
        // Ensure all required fields exist with defaults
        const safeSettings = {
          general: {
            systemName: 'IPatroller System',
            defaultLanguage: 'en',
            enableNotifications: true,
            timezone: 'Asia/Manila',
            ...loadedSettings.general
          },
          security: {
            sessionTimeout: 30,
            enable2FA: false,
            enableAuditLogging: true,
            passwordPolicy: 'medium',
            ...loadedSettings.security
          },
          ipatroller: {
            autoBackup: true,
            backupFrequency: 'daily',
            dataRetention: 90,
            enableDataValidation: true,
            ...loadedSettings.ipatroller
          }
        };
        setSystemSettings(safeSettings);
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  // Save system settings to Firebase
  const saveSystemSettings = async () => {
    setSettingsLoading(true);
    try {
      await setDoc(doc(db, 'system_settings', 'main'), {
        ...systemSettings,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'Unknown'
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving system settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Handle settings change
  const handleSettingChange = (section, key, value) => {
    // Handle number inputs to prevent NaN
    let processedValue = value;
    if (typeof value === 'string' && key.includes('Timeout') || key.includes('Retention')) {
      const numValue = parseInt(value);
      processedValue = isNaN(numValue) ? 30 : numValue; // Default to 30 if NaN
    }
    
    setSystemSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: processedValue
      }
    }));
  };

  // Create backup of IPatroller data
  const createBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        data: allData,
        settings: systemSettings,
        version: '1.0.0',
        municipalities: municipalities,
        totalRecords: Object.keys(allData).length,
        backupType: 'Full System Backup'
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ipatroller-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message with more details
      const successMessage = `✅ Backup created successfully!\n\n📊 Backup Details:\n• ${Object.keys(allData).length} months of data\n• ${municipalities.length} municipalities\n• System settings included\n• Created: ${new Date().toLocaleString()}`;
      alert(successMessage);
    } catch (error) {
      console.error('Backup creation error:', error);
      alert('❌ Error creating backup. Please try again.');
    }
  };

  // Restore data from backup
  const restoreData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        if (backupData.data && backupData.timestamp) {
          // Validate backup data structure
          const validationMessage = `📋 Backup Validation:\n\n✅ Valid backup file detected\n📅 Created: ${new Date(backupData.timestamp).toLocaleString()}\n📊 Data: ${Object.keys(backupData.data).length} months\n🏛️ Municipalities: ${backupData.municipalities?.length || 'N/A'}\n🔧 Settings: ${backupData.settings ? 'Included' : 'Not included'}\n\n⚠️ Note: This is a preview. Actual restore functionality would be implemented here.`;
          alert(validationMessage);
        } else {
          alert('❌ Invalid backup file format. Please ensure this is a valid IPatroller backup file.');
        }
      } catch (error) {
        console.error('Restore error:', error);
        alert('❌ Error reading backup file. Please check the file format and try again.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <DashboardLayout activePage="setups">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-cogs text-secondary fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Setups</h2>
            <p className="text-muted mb-0 small">System configuration and setup options</p>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="border-0">
            <Nav.Item>
              <Nav.Link eventKey="municipalities" className="border-0 text-muted">Municipality Privileges</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="system" className="border-0 text-muted">System Settings</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="backup" className="border-0 text-muted">Backup & Restore</Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        {activeTab === 'municipalities' && (
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1">Municipality Privileges</h4>
                  <p className="text-muted mb-0">Manage access privileges for each municipality</p>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      const missingMunicipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG']
                        .filter(name => !municipalities.find(m => m.name === name));
                      
                      if (missingMunicipalities.length > 0) {
                        const newMunicipalities = missingMunicipalities.map((name, index) => ({
                          id: municipalities.length + index + 1,
                          name,
                          status: 'Active',
                          privileges: ['View Reports'],
                          lastUpdated: new Date().toISOString().split('T')[0]
                        }));
                        
                        setMunicipalities([...municipalities, ...newMunicipalities]);
                        alert(`Added ${missingMunicipalities.length} missing municipalities: ${missingMunicipalities.join(', ')}`);
                      } else {
                        alert('All IPatroller municipalities are already configured!');
                      }
                    }}
                  >
                    <i className="fas fa-sync-alt me-1"></i>
                    Sync with IPatroller
                  </Button>
                </div>
              </div>
              
              {/* Connection Summary */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card border-0 bg-light">
                    <div className="card-body text-center">
                      <h5 className="text-primary mb-1">{municipalities.length}</h5>
                      <small className="text-muted">Total Municipalities</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 bg-light">
                    <div className="card-body text-center">
                      <h5 className="text-success mb-1">
                        {municipalities.filter(m => hasIPatrollerData(m.name)).length}
                      </h5>
                      <small className="text-muted">Connected to IPatroller</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 bg-light">
                    <div className="card-body text-center">
                      <h5 className="text-warning mb-1">
                        {municipalities.filter(m => !hasIPatrollerData(m.name)).length}
                      </h5>
                      <small className="text-muted">No IPatroller Data</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 bg-light">
                    <div className="card-body text-center">
                      <h5 className="text-info mb-1">
                        {Object.keys(allData).length}
                      </h5>
                      <small className="text-muted">Months with Data</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="table-responsive">
                <Table className="table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Municipality</th>
                      <th>Status</th>
                      <th>Privileges</th>
                      <th>IPatroller Data</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {municipalities.map((municipality) => {
                      const hasData = hasIPatrollerData(municipality.name);
                      const dataSummary = getIPatrollerDataSummary(municipality.name);
                      
                      return (
                        <tr key={municipality.id}>
                          <td className="fw-semibold">{municipality.name}</td>
                          <td>
                            <Badge bg={municipality.status === 'Active' ? 'success' : 'danger'}>
                              {municipality.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {municipality.privileges.slice(0, 3).map((privilege, idx) => (
                                <Badge key={idx} bg="primary" className="small">
                                  {privilege}
                                </Badge>
                              ))}
                              {municipality.privileges.length > 3 && (
                                <Badge bg="secondary" className="small">
                                  +{municipality.privileges.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            {hasData ? (
                              <div className="d-flex flex-column gap-1">
                                <Badge bg="success" className="small">
                                  <i className="fas fa-check me-1"></i>
                                  Connected
                                </Badge>
                                <small className="text-muted">
                                  {dataSummary.totalMonths} month(s), {dataSummary.totalDays} days
                                </small>
                              </div>
                            ) : (
                              <Badge bg="warning" className="small">
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                No Data
                              </Badge>
                            )}
                          </td>
                          <td className="text-muted small">{municipality.lastUpdated}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant={municipality.status === 'Active' ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                onClick={() => handleStatusToggle(municipality.id)}
                              >
                                {municipality.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditPrivileges(municipality)}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {activeTab === 'system' && (
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1">System Settings</h4>
                  <p className="text-muted mb-0">Configure system-wide settings and preferences</p>
                </div>
                <div className="d-flex gap-2">
                  {settingsSaved && (
                    <div className="alert alert-success py-2 px-3 mb-0" style={{ fontSize: '0.9rem' }}>
                      <i className="fas fa-check me-1"></i>
                      Settings saved!
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={saveSystemSettings}
                    disabled={settingsLoading}
                  >
                    {settingsLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1"></i>
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <Row className="g-3">
                <Col md={6}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <i className="fas fa-cog text-primary me-2"></i>
                        General Settings
                      </h5>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>System Name</Form.Label>
                          <Form.Control 
                            type="text" 
                            value={systemSettings.general.systemName}
                            onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Default Language</Form.Label>
                          <Form.Select 
                            value={systemSettings.general.defaultLanguage}
                            onChange={(e) => handleSettingChange('general', 'defaultLanguage', e.target.value)}
                          >
                            <option value="en">English</option>
                            <option value="tl">Tagalog</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Timezone</Form.Label>
                          <Form.Select 
                            value={systemSettings.general.timezone}
                            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                          >
                            <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                            <option value="UTC">UTC (GMT+0)</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch" 
                            id="notifications" 
                            label="Enable Notifications" 
                            checked={systemSettings.general.enableNotifications}
                            onChange={(e) => handleSettingChange('general', 'enableNotifications', e.target.checked)}
                          />
                        </Form.Group>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <i className="fas fa-shield-alt text-warning me-2"></i>
                        Security Settings
                      </h5>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Session Timeout (minutes)</Form.Label>
                          <Form.Control 
                            type="number" 
                            value={systemSettings.security.sessionTimeout || 30}
                            onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                            min="5" 
                            max="120" 
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Password Policy</Form.Label>
                          <Form.Select 
                            value={systemSettings.security.passwordPolicy}
                            onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
                          >
                            <option value="low">Low (6+ characters)</option>
                            <option value="medium">Medium (8+ characters, mixed)</option>
                            <option value="high">High (10+ characters, special chars)</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch" 
                            id="2fa" 
                            label="Enable Two-Factor Authentication" 
                            checked={systemSettings.security.enable2FA}
                            onChange={(e) => handleSettingChange('security', 'enable2FA', e.target.checked)}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch" 
                            id="audit" 
                            label="Enable Audit Logging" 
                            checked={systemSettings.security.enableAuditLogging}
                            onChange={(e) => handleSettingChange('security', 'enableAuditLogging', e.target.checked)}
                          />
                        </Form.Group>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={12}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <i className="fas fa-database text-info me-2"></i>
                        IPatroller Data Settings
                      </h5>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Check 
                              type="switch" 
                              id="autoBackup" 
                              label="Enable Automatic Backup" 
                              checked={systemSettings.ipatroller.autoBackup}
                              onChange={(e) => handleSettingChange('ipatroller', 'autoBackup', e.target.checked)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Backup Frequency</Form.Label>
                            <Form.Select 
                              value={systemSettings.ipatroller.backupFrequency}
                              onChange={(e) => handleSettingChange('ipatroller', 'backupFrequency', e.target.value)}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Data Retention (days)</Form.Label>
                            <Form.Control 
                              type="number" 
                              value={systemSettings.ipatroller.dataRetention || 90}
                              onChange={(e) => handleSettingChange('ipatroller', 'dataRetention', e.target.value)}
                              min="30" 
                              max="365" 
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Check 
                              type="switch" 
                              id="dataValidation" 
                              label="Enable Data Validation" 
                              checked={systemSettings.ipatroller.enableDataValidation}
                              onChange={(e) => handleSettingChange('ipatroller', 'enableDataValidation', e.target.checked)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {activeTab === 'backup' && (
          <div className="backup-container">
            {/* Header Section */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}>
                  <i className="fas fa-shield-alt text-white fs-4"></i>
                </div>
                <div>
                  <h4 className="fw-bold mb-1">Backup & Restore</h4>
                  <p className="text-muted mb-0">Secure your data with automated backups and manual restoration</p>
                </div>
              </div>
            </div>

            {/* Main Backup Actions */}
            <Row className="g-4 mb-4">
              <Col lg={6}>
                <Card className="border-0 shadow-sm h-100" style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Card.Body className="p-4 text-center">
                    <div className="mb-4">
                      <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        boxShadow: '0 8px 25px rgba(40, 167, 69, 0.3)'
                      }}>
                        <i className="fas fa-download text-white fs-2"></i>
                      </div>
                      <h5 className="fw-bold mb-2">Create Backup</h5>
                      <p className="text-muted mb-3">Generate a complete backup of all system data including IPatroller records, settings, and metadata</p>
                    </div>
                    
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={createBackup}
                      className="rounded-pill px-4 py-2"
                      style={{
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                      }}
                    >
                      <i className="fas fa-download me-2"></i>
                      Create Backup
                    </Button>
                    
                    <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <i className="fas fa-check-circle text-success"></i>
                        <small className="fw-semibold text-success">What's Included</small>
                      </div>
                      <div className="row text-center">
                        <div className="col-4">
                          <small className="text-muted d-block">IPatroller Data</small>
                        </div>
                        <div className="col-4">
                          <small className="text-muted d-block">System Settings</small>
                        </div>
                        <div className="col-4">
                          <small className="text-muted d-block">Metadata</small>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={6}>
                <Card className="border-0 shadow-sm h-100" style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 193, 7, 0.1)'
                }}>
                  <Card.Body className="p-4 text-center">
                    <div className="mb-4">
                      <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                        boxShadow: '0 8px 25px rgba(255, 193, 7, 0.3)'
                      }}>
                        <i className="fas fa-upload text-white fs-2"></i>
                      </div>
                      <h5 className="fw-bold mb-2">Restore Data</h5>
                      <p className="text-muted mb-3">Restore your system from a previously created backup file</p>
                    </div>
                    
                    <input
                      type="file"
                      accept=".json"
                      onChange={restoreData}
                      style={{ display: 'none' }}
                      id="restore-file"
                    />
                    <Button 
                      variant="warning" 
                      size="lg"
                      onClick={() => document.getElementById('restore-file').click()}
                      className="rounded-pill px-4 py-2"
                      style={{
                        background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.3)';
                      }}
                    >
                      <i className="fas fa-upload me-2"></i>
                      Restore Data
                    </Button>
                    
                    <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(220, 53, 69, 0.1)' }}>
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <i className="fas fa-exclamation-triangle text-danger"></i>
                        <small className="fw-semibold text-danger">Important Warning</small>
                      </div>
                      <small className="text-muted">This action will overwrite all current data. Please ensure you have a backup before proceeding.</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Backup Information Dashboard */}
            <Row className="g-4">
              <Col lg={8}>
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
                        background: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
                        boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)'
                      }}>
                        <i className="fas fa-chart-line text-white"></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Backup Information</h5>
                        <p className="text-muted mb-0">Current system data overview</p>
                      </div>
                    </div>
                    
                    <Row className="g-3">
                      <Col md={4}>
                        <div className="text-center p-3 rounded-3" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                          <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2" style={{
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                          }}>
                            <i className="fas fa-calendar-alt text-white"></i>
                          </div>
                          <h4 className="fw-bold text-primary mb-1">{Object.keys(allData).length}</h4>
                          <small className="text-muted fw-semibold">Months with Data</small>
                        </div>
                      </Col>
                      
                      <Col md={4}>
                        <div className="text-center p-3 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                          <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2" style={{
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                          }}>
                            <i className="fas fa-map-marker-alt text-white"></i>
                          </div>
                          <h4 className="fw-bold text-success mb-1">12</h4>
                          <small className="text-muted fw-semibold">Total Municipalities</small>
                        </div>
                      </Col>
                      
                      <Col md={4}>
                        <div className="text-center p-3 rounded-3" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                          <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2" style={{
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
                            boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)'
                          }}>
                            <i className="fas fa-clock text-white"></i>
                          </div>
                          <h4 className="fw-bold text-info mb-1">
                            {new Date().toLocaleDateString()}
                          </h4>
                          <small className="text-muted fw-semibold">Last Backup Date</small>
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
                        <i className="fas fa-list text-white"></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Municipalities</h5>
                        <p className="text-muted mb-0">Covered areas</p>
                      </div>
                    </div>
                    
                    <div className="municipalities-list">
                      {['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'].map((municipality, index) => (
                        <div key={index} className="d-flex align-items-center justify-content-between p-2 mb-2 rounded-3" style={{
                          background: 'rgba(102, 126, 234, 0.05)',
                          border: '1px solid rgba(102, 126, 234, 0.1)'
                        }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center justify-content-center rounded-circle" style={{
                              width: 24,
                              height: 24,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                            }}>
                              <i className="fas fa-map-marker-alt text-white" style={{ fontSize: '0.7rem' }}></i>
                            </div>
                            <small className="fw-semibold text-dark">{municipality}</small>
                          </div>
                          <Badge bg="success" className="rounded-pill">
                            <i className="fas fa-check me-1"></i>
                            Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* Edit Municipality Privileges Modal */}
        <Modal show={showEditModal} onHide={closeEditModal} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0" style={{ 
            background: '#f5f7fa', 
            borderTopLeftRadius: '1rem', 
            borderTopRightRadius: '1rem' 
          }}>
            <Modal.Title className="d-flex align-items-center fw-bold">
              <i className="fas fa-edit me-2 text-primary" style={{ fontSize: '1.3rem' }} />
              Edit Municipality Privileges
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body className="pt-3 pb-4 px-4">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Municipality Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-control-lg rounded-3"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="form-control-lg rounded-3"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Privileges</Form.Label>
                <div className="border rounded-3 p-3" style={{ background: '#f8f9fa' }}>
                  <div className="row">
                    {availablePrivileges.map((privilege, index) => (
                      <div key={index} className="col-md-6 mb-2">
                        <Form.Check
                          type="checkbox"
                          id={`privilege-${index}`}
                          label={privilege}
                          checked={editForm.privileges.includes(privilege)}
                          onChange={() => setEditForm(prev => ({
                            ...prev,
                            privileges: prev.privileges.includes(privilege)
                              ? prev.privileges.filter(p => p !== privilege)
                              : [...prev.privileges, privilege]
                          }))}
                          className="fw-semibold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Form.Group>

              <div className="mt-3 p-3 bg-light rounded-3">
                <h6 className="fw-bold mb-2">
                  <i className="fas fa-info-circle text-info me-2"></i>
                  Selected Privileges ({editForm.privileges.length})
                </h6>
                {editForm.privileges.length > 0 ? (
                  <div className="d-flex flex-wrap gap-1">
                    {editForm.privileges.map((privilege, idx) => (
                      <Badge key={idx} bg="primary" className="small">
                        {privilege}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0 small">No privileges selected</p>
                )}
              </div>

              {/* Users in this municipality */}
              <div className="mt-3 p-3 bg-light rounded-3">
                <h6 className="fw-bold mb-2">
                  <i className="fas fa-users text-success me-2"></i>
                  Users in {editForm.name} ({usersInMunicipality.length})
                </h6>
                {usersInMunicipality.length > 0 ? (
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersInMunicipality.map((user) => (
                          <tr key={user.id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td><Badge bg={user.role === 'Administrator' ? 'primary' : 'secondary'}>{user.role}</Badge></td>
                            <td><Badge bg={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted mb-0 small">No users assigned to this municipality</p>
                )}
              </div>
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0 pb-4 px-4">
            <Button 
              variant="secondary" 
              className="px-4 py-2 rounded-3" 
              onClick={closeEditModal}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="px-4 py-2 rounded-3 ms-2" 
              onClick={saveEditChanges}
            >
              <i className="fas fa-save me-2"></i>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default Setups; 