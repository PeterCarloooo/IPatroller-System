import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Profile from './Profile';
import ChangePassword from './ChangePassword';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

  // Settings action tiles + activity/status tiles
  const settingsTiles = (
    <div className="row g-4 mb-4">
      {/* Action Tiles */}
      <div className="col-12 col-sm-6 col-lg-4">
        <div className="card shadow-sm h-100 tile-card" style={{ background: '#f8fafc', borderRadius: '1.25rem', transition: 'box-shadow 0.2s, transform 0.2s' }} role="button" onClick={() => setShowChangePassword(true)}>
          <div className="card-body d-flex flex-column align-items-center justify-content-center p-5">
            <div className="mb-4">
              <i className="fas fa-key text-primary" style={{ fontSize: 44 }} />
            </div>
            <h4 className="fw-bold mb-2 text-center" style={{ fontSize: '1.25rem' }}>Change Password</h4>
          </div>
        </div>
      </div>
      <div className="col-12 col-sm-6 col-lg-4">
        <div className="card shadow-sm h-100 tile-card" style={{ background: '#f8fafc', borderRadius: '1.25rem', transition: 'box-shadow 0.2s, transform 0.2s' }} role="button" onClick={() => alert('Notification Settings coming soon!')}>
          <div className="card-body d-flex flex-column align-items-center justify-content-center p-5">
            <div className="mb-4">
              <i className="fas fa-bell text-warning" style={{ fontSize: 44 }} />
            </div>
            <h4 className="fw-bold mb-2 text-center" style={{ fontSize: '1.25rem' }}>Notification Settings</h4>
          </div>
        </div>
      </div>
      <div className="col-12 col-sm-6 col-lg-4">
        <div className="card shadow-sm h-100 tile-card" style={{ background: '#f8fafc', borderRadius: '1.25rem', transition: 'box-shadow 0.2s, transform 0.2s' }} role="button" onClick={() => alert('Security Settings coming soon!')}>
          <div className="card-body d-flex flex-column align-items-center justify-content-center p-5">
            <div className="mb-4">
              <i className="fas fa-shield-alt text-success" style={{ fontSize: 44 }} />
            </div>
            <h4 className="fw-bold mb-2 text-center" style={{ fontSize: '1.25rem' }}>Security Settings</h4>
          </div>
        </div>
      </div>
      {/* Recent Account Activity Tile */}
      <div className="col-12 col-md-6">
        <div className="card shadow-sm h-100 tile-card" style={{ background: '#f8fafc', borderRadius: '1.25rem', transition: 'box-shadow 0.2s, transform 0.2s' }}>
          <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
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
          </div>
        </div>
      </div>
      {/* Account Status Tile */}
      <div className="col-12 col-md-6">
        <div className="card shadow-sm h-100 tile-card" style={{ background: '#f8fafc', borderRadius: '1.25rem', transition: 'box-shadow 0.2s, transform 0.2s' }}>
          <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
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
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout activePage="settings">
      <div className="container py-4">
        {settingsTiles}
        {/* ...rest of your code... */}
      </div>
      <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </DashboardLayout>
  );
}

export default Settings;

/* Add to index.css or here for tile hover effect */
// .tile-card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 8px 24px rgba(18,102,241,0.13) !important; cursor: pointer; } 