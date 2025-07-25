import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Profile from './Profile';
import ChangePassword from './ChangePassword';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Container, Card, Row, Col, Stack } from 'react-bootstrap';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastLoginTime, setLastLoginTime] = useState(null);
  const [location, setLocation] = useState('Loading location...');

  // Fetch recent password changes for the current user
  useEffect(() => {
    async function fetchActivity() {
      const user = auth.currentUser;
      if (!user) return;
      setLastLoginTime(user.metadata.lastSignInTime);
      // Fetch password changes
      const q = query(collection(db, 'password_changes'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const activity = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })).sort((a, b) => b.changedAt?.seconds - a.changedAt?.seconds);
      setRecentActivity(activity);
    }
    fetchActivity();
    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => setLocation('Unavailable')
      );
    } else {
      setLocation('Unavailable');
    }
  }, []);

  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Not available';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout activePage="settings">
      <Container fluid className="py-4 px-2 px-md-4">
        <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light bg-opacity-75 p-4">
          <Stack direction="horizontal" gap={3} className="align-items-center flex-wrap">
            <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
              <i className="fas fa-cog text-primary" style={{ fontSize: '1.7rem' }}></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0" style={{ fontSize: '1.6rem', letterSpacing: '0.5px' }}>Settings</h2>
              <p className="text-muted mb-0" style={{ fontSize: '1.05rem' }}>Manage your account and system preferences</p>
            </div>
          </Stack>
        </Card>
        <Row className="g-4 mb-4">
          {/* Action Tiles */}
          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 tile-card bg-white border-0 rounded-4" role="button" onClick={() => setShowChangePassword(true)}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-key text-primary" style={{ fontSize: 44 }} />
                </div>
                <h4 className="fw-bold mb-2 text-center" style={{ fontSize: '1.25rem' }}>Change Password</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 tile-card bg-white border-0 rounded-4" role="button" onClick={() => alert('Notification Settings coming soon!')}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-bell text-warning" style={{ fontSize: 44 }} />
                </div>
                <h4 className="fw-bold mb-2 text-center" style={{ fontSize: '1.25rem' }}>Notification Settings</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Card className="shadow-sm h-100 tile-card bg-white border-0 rounded-4" role="button" onClick={() => alert('Security Settings coming soon!')}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                <div className="mb-4">
                  <i className="fas fa-shield-alt text-success" style={{ fontSize: 44 }} />
                </div>
                <h4 className="fw-bold mb-2 text-center" style={{ fontSize: '1.25rem' }}>Security Settings</h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="g-4 mb-4">
          {/* Recent Account Activity Tile */}
          <Col xs={12} md={6}>
            <Card className="shadow-sm h-100 tile-card bg-white border-0 rounded-4">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <div className="mb-3 w-100 text-center">
                  <i className="fas fa-history text-info" style={{ fontSize: 36 }} />
                  <h5 className="fw-bold mb-2 mt-2 text-center" style={{ fontSize: '1.15rem' }}>Recent Account Activity</h5>
                </div>
                <hr className="w-100 my-3" />
                {recentActivity.length === 0 ? (
                  <div className="text-muted">No recent activity.</div>
                ) : (
                  <ul className="list-group list-group-flush w-100">
                    {recentActivity.slice(0, 5).map(act => (
                      <li className="list-group-item d-flex align-items-center" key={act.id}>
                        <i className="fas fa-key text-primary me-2"></i>
                        Password changed
                        <span className="ms-auto text-muted small">{formatLastLogin(act.changedAt?.toDate?.() || act.changedAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card.Body>
            </Card>
          </Col>
          {/* Account Status Tile */}
          <Col xs={12} md={6}>
            <Card className="shadow-sm h-100 tile-card bg-white border-0 rounded-4">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <div className="mb-3 w-100 text-center">
                  <i className="fas fa-user-shield text-success" style={{ fontSize: 36 }} />
                  <h5 className="fw-bold mb-2 mt-2 text-center" style={{ fontSize: '1.15rem' }}>Account Status</h5>
                </div>
                <hr className="w-100 my-3" />
                <div className="d-flex align-items-center mb-3">
                  <i className="fas fa-circle text-success me-2"></i>
                  <span>Active</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="fas fa-calendar-alt me-2"></i>
                  <div>
                    <div className="fw-bold">Last Login</div>
                    <small className="text-muted">{formatLastLogin(lastLoginTime)}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  <div>
                    <div className="fw-bold">Current Location</div>
                    <small className="text-muted">{location}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </DashboardLayout>
  );
}

export default Settings;

/* Add to index.css or here for tile hover effect */
// .tile-card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 8px 24px rgba(18,102,241,0.13) !important; cursor: pointer; } 