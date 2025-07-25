import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import ChangePassword from './ChangePassword';

function Profile({ section }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [lastLoginTime, setLastLoginTime] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phoneNumber: '',
    municipality: ''
  });
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    setRefreshing(true);
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      setLastLoginTime(user.metadata.lastSignInTime);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: user.email || '',
          role: data.role || '',
          phoneNumber: data.phoneNumber || '',
          municipality: data.municipality || ''
        });
        setUserRole(data.role || '');
      } else {
        setFormData({
          firstName: user.displayName ? user.displayName.split(' ')[0] : '',
          lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
          email: user.email || '',
          role: '',
          phoneNumber: '',
          municipality: ''
        });
        setUserRole('');
      }
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    setLastLoginTime(user.metadata.lastSignInTime);
    const unsub = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: user.email || '',
          role: data.role || '',
          phoneNumber: data.phoneNumber || '',
          municipality: data.municipality || ''
        });
        setUserRole(data.role || '');
      }
      setLoading(false);
    });
    return () => unsub();
    // eslint-disable-next-line
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

  const [location, setLocation] = useState('Loading location...');
  useEffect(() => {
    const getLocationName = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.municipality || 'Unknown Location';
        const region = data.address.state || '';
        setLocation(`${city}, ${region}`);
      } catch (error) {
        setLocation('Location unavailable');
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getLocationName(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLocation('Location unavailable');
        }
      );
    } else {
      setLocation('Geolocation not supported');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      setError('First name, last name, and phone number are required.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No authenticated user.');
        return;
      }
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        municipality: formData.municipality
      }, { merge: true });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  // Profile Info Card
  const profileInfoCard = (
    <div className="w-100" style={{ padding: '0rem 1.5rem' }}>
      <div className="d-flex flex-column align-items-center mb-4">
        <h3 className="fw-bold mb-1 text-center" style={{ fontSize: '2rem' }}>Profile Information</h3>
        <p className="text-muted mb-0 text-center" style={{ fontSize: '1.1rem' }}>Update your account information</p>
        <button className="btn btn-outline-secondary btn-sm mt-3" onClick={fetchProfile} disabled={refreshing || loading}>
          {refreshing ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : (
            <i className="fas fa-sync-alt me-2"></i>
          )}
          Refresh
        </button>
      </div>
      <hr className="my-4" />
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {success && <div className="alert alert-success text-center">{success}</div>}
          {error && <div className="alert alert-danger text-center">{error}</div>}
          <div className="row g-3 mb-4">
            {userRole === 'Administrator' ? (
              <>
                <div className="col-12 col-md-6">
                  <div className="form-group mb-2">
                    <label htmlFor="email" className="fw-semibold mb-1">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      style={{ background: '#f1f3f6', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="form-group mb-2">
                    <label htmlFor="role" className="fw-semibold mb-1">Role</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="role"
                      value={formData.role}
                      disabled
                      style={{ background: '#f1f3f6', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-12 col-md-6">
                  <div className="form-group mb-2">
                    <label htmlFor="firstName" className="fw-semibold mb-1">First Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      style={{ background: !isEditing ? '#f1f3f6' : undefined, border: !isEditing ? '1px solid #e0e0e0' : undefined }}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="form-group mb-2">
                    <label htmlFor="lastName" className="fw-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      style={{ background: !isEditing ? '#f1f3f6' : undefined, border: !isEditing ? '1px solid #e0e0e0' : undefined }}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="form-group mb-2">
                    <label htmlFor="email" className="fw-semibold mb-1">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      style={{ background: '#f1f3f6', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="form-group mb-2">
                    <label htmlFor="role" className="fw-semibold mb-1">Role</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="role"
                      value={formData.role}
                      disabled
                      style={{ background: '#f1f3f6', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="form-group mb-2">
                    <label htmlFor="phoneNumber" className="fw-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      style={{ background: !isEditing ? '#f1f3f6' : undefined, border: !isEditing ? '1px solid #e0e0e0' : undefined }}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="form-group mb-2">
                    <label htmlFor="municipality" className="fw-semibold mb-1">Municipality</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="municipality"
                      value={formData.municipality}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      style={{ background: !isEditing ? '#f1f3f6' : undefined, border: !isEditing ? '1px solid #e0e0e0' : undefined }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="d-flex flex-column flex-md-row gap-2 justify-content-center mt-2">
            {userRole !== 'Administrator' && !isEditing ? (
              <button className="btn btn-primary flex-fill py-2 px-4" onClick={() => setIsEditing(true)}>
                <i className="fas fa-edit me-2"></i>Edit Profile
              </button>
            ) : null}
            {userRole !== 'Administrator' && isEditing ? (
              <>
                <button className="btn btn-success flex-fill py-2 px-4" onClick={handleSave}>
                  <i className="fas fa-save me-2"></i>Save
                </button>
                <button className="btn btn-danger flex-fill py-2 px-4" onClick={() => setIsEditing(false)}>
                  <i className="fas fa-times me-2"></i>Cancel
                </button>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );

  // Security Card (placeholder)
  const securityCard = (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-4">Security</h5>
        <p className="text-muted">Security settings and options will be available here.</p>
      </div>
    </div>
  );

  // Render based on section prop
  if (section === 'profile') {
    return (
      <div className="row justify-content-center">
        {profileInfoCard}
      </div>
    );
  }
  if (section === 'account') {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-4">Account Settings</h5>
          <div className="text-muted">Account settings are now managed in the Settings tab.</div>
        </div>
      </div>
    );
  }
  if (section === 'security') {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8 mb-4"></div>
        <div className="col-md-4">
          {securityCard}
        </div>
      </div>
    );
  }
  // Default: show all
  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          {profileInfoCard}
          {/* AccountSettings removed */}
        </div>
      </div>
    </div>
  );
}

export default Profile; 