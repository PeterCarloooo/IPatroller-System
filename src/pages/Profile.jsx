import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Container, Card, Row, Col, Stack, Button, Form, Spinner, Alert } from 'react-bootstrap';

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
    <div className="w-100">
      <div className="w-100 p-5" style={{
        background: 'transparent'
      }}>
        {/* Header Section */}
        <div className="text-center mb-5">
          <div className="d-flex align-items-center justify-content-center mb-4">
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              border: '3px solid rgba(255, 255, 255, 0.8)'
            }}>
              <i className="fas fa-user text-white" style={{ fontSize: '2rem' }}></i>
            </div>
          </div>
          <h2 className="fw-bold mb-2" style={{ 
            fontSize: '2rem', 
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Profile Information</h2>
          <p className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: 500 }}>Manage your account details and preferences</p>
        </div>
        
        {/* Last Login Info */}
        {lastLoginTime && (
          <div className="text-center mb-4 p-3" style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <i className="fas fa-clock text-primary me-2"></i>
            <span className="fw-semibold" style={{ color: '#667eea' }}>
              Last Login: {formatLastLogin(lastLoginTime)}
            </span>
          </div>
        )}
        
        <hr className="my-4" style={{ borderColor: 'rgba(102, 126, 234, 0.2)' }} />
        
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {success && (
              <Alert variant="success" className="text-center rounded-4 mb-4" style={{
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                border: '1px solid #c3e6cb',
                color: '#155724'
              }}>
                <i className="fas fa-check-circle me-2"></i>
                {success}
              </Alert>
            )}
            {error && (
              <Alert variant="danger" className="text-center rounded-4 mb-4" style={{
                background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                border: '1px solid #f5c6cb',
                color: '#721c24'
              }}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
            <Row className="g-4 mb-4">
              {userRole === 'Administrator' ? (
                <>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                        <i className="fas fa-envelope me-2" style={{ color: '#667eea' }}></i>Email
                      </Form.Label>
                      <Form.Control 
                        type="email" 
                        value={formData.email} 
                        disabled 
                        className="rounded-4"
                        style={{ 
                          background: 'rgba(248, 249, 250, 0.8)', 
                          border: '2px solid rgba(102, 126, 234, 0.1)',
                          padding: '0.75rem 1rem',
                          fontSize: '1rem'
                        }} 
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                        <i className="fas fa-user-tag me-2" style={{ color: '#667eea' }}></i>Role
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        value={formData.role} 
                        disabled 
                        className="rounded-4"
                        style={{ 
                          background: 'rgba(248, 249, 250, 0.8)', 
                          border: '2px solid rgba(102, 126, 234, 0.1)',
                          padding: '0.75rem 1rem',
                          fontSize: '1rem'
                        }} 
                      />
                    </Form.Group>
                  </Col>
                </>
              ) : (
                <>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                        <i className="fas fa-user me-2" style={{ color: '#667eea' }}></i>First Name
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                        className="rounded-4"
                        style={{
                          background: !isEditing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(102, 126, 234, 0.1)',
                          padding: '0.75rem 1rem',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          if (isEditing) {
                            e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (isEditing) {
                            e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                        <i className="fas fa-user me-2" style={{ color: '#667eea' }}></i>Last Name
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                        className="rounded-4"
                        style={{
                          background: !isEditing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(102, 126, 234, 0.1)',
                          padding: '0.75rem 1rem',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          if (isEditing) {
                            e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (isEditing) {
                            e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-envelope me-2" style={{ color: '#667eea' }}></i>Email
                  </Form.Label>
                  <Form.Control 
                    type="email" 
                    value={formData.email} 
                    disabled 
                    className="rounded-4"
                    style={{ 
                      background: 'rgba(248, 249, 250, 0.8)', 
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem'
                    }} 
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-phone me-2" style={{ color: '#667eea' }}></i>Phone Number
                  </Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    className="rounded-4"
                    style={{
                      background: !isEditing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-map-marker-alt me-2" style={{ color: '#667eea' }}></i>Municipality
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="municipality" 
                    value={formData.municipality} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    className="rounded-4"
                    style={{
                      background: !isEditing ? 'rgba(248, 249, 250, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      if (isEditing) {
                        e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (isEditing) {
                        e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-user-tag me-2" style={{ color: '#667eea' }}></i>Role
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    value={formData.role} 
                    disabled 
                    className="rounded-4"
                    style={{ 
                      background: 'rgba(248, 249, 250, 0.8)', 
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem'
                    }} 
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Action Buttons */}
            <div className="text-center mt-4">
              {userRole !== 'Administrator' && !isEditing ? (
                <Button
                  variant="primary"
                  className="py-3 px-5 d-flex align-items-center justify-content-center mx-auto"
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    minWidth: '200px'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <i className="fas fa-edit me-2"></i>Edit Profile
                </Button>
              ) : null}
              {userRole !== 'Administrator' && isEditing ? (
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button
                    variant="success"
                    className="py-3 px-5 d-flex align-items-center justify-content-center"
                    onClick={handleSave}
                    style={{
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 8px 25px rgba(40, 167, 69, 0.3)',
                      transition: 'all 0.3s ease',
                      minWidth: '150px'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(40, 167, 69, 0.4)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.3)';
                    }}
                  >
                    <i className="fas fa-save me-2"></i>Save Changes
                  </Button>
                  <Button 
                    variant="light" 
                    className="py-3 px-5 d-flex align-items-center justify-content-center" 
                    onClick={() => setIsEditing(false)}
                    style={{
                      background: 'rgba(248, 249, 250, 0.8)',
                      border: '2px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#6c757d',
                      transition: 'all 0.3s ease',
                      minWidth: '150px'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(248, 249, 250, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <i className="fas fa-times me-2"></i>Cancel
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
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
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>{profileInfoCard}</Col>
      </Row>
    );
  }
  if (section === 'account') {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-4">Account Settings</h5>
          <div className="text-muted">Account settings are now managed in the Settings tab.</div>
        </Card.Body>
      </Card>
    );
  }
  if (section === 'security') {
    return (
      <Row className="justify-content-center">
        <Col md={8} className="mb-4"></Col>
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4">Security</h5>
              <p className="text-muted">Security settings and options will be available here.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }
  // Default: show all
  return (
    <div className="w-100">
      {profileInfoCard}
    </div>
  );
}

export default Profile; 