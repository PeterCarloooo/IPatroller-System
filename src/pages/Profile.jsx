import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import ChangePassword from './ChangePassword';
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
    <Container fluid className="py-4 px-2 px-md-4">
      <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light bg-opacity-75 p-4">
        <Stack direction="horizontal" gap={3} className="align-items-center flex-wrap mb-3">
          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-user text-primary" style={{ fontSize: '1.7rem' }}></i>
          </div>
          <div>
            <h3 className="fw-bold mb-1" style={{ fontSize: '1.6rem', letterSpacing: '0.5px' }}>Profile Information</h3>
            <p className="text-muted mb-0" style={{ fontSize: '1.05rem' }}>Update your account information</p>
          </div>
        </Stack>
        <hr className="my-4" />
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {success && <Alert variant="success" className="text-center">{success}</Alert>}
            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            <Row className="g-3 mb-4">
              {userRole === 'Administrator' ? (
                <>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold mb-1">Email</Form.Label>
                      <Form.Control type="email" value={formData.email} disabled style={{ background: '#f1f3f6', border: '1px solid #e0e0e0' }} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold mb-1">Role</Form.Label>
                      <Form.Control type="text" value={formData.role} disabled style={{ background: '#f1f3f6', border: '1px solid #e0e0e0' }} />
                    </Form.Group>
                  </Col>
                </>
              ) : (
                <>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold mb-1">First Name</Form.Label>
                      <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!isEditing} style={{ background: !isEditing ? '#f1f3f6' : undefined, border: !isEditing ? '1px solid #e0e0e0' : undefined }} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold mb-1">Last Name</Form.Label>
                      <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={!isEditing} style={{ background: !isEditing ? '#f1f3f6' : undefined, border: !isEditing ? '1px solid #e0e0e0' : undefined }} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold mb-1">Email</Form.Label>
                      <Form.Control type="email" value={formData.email} disabled style={{ background: '#f1f3f6', border: '1px solid #e0e0e0' }} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold mb-1">Role</Form.Label>
                      <Form.Control type="text" value={formData.role} disabled style={{ background: '#f1f3f6', border: '1px solid #e0e0e0' }} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold mb-1">Phone Number</Form.Label>
                      <Form.Control type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} disabled={!isEditing} style={{ background: !isEditing ? '#f1f3f6' : undefined, border: !isEditing ? '1px solid #e0e0e0' : undefined }} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold mb-1">Municipality</Form.Label>
                      <Form.Control type="text" value={formData.municipality} onChange={handleInputChange} disabled={!isEditing} style={{ background: !isEditing ? '#f1f3f6' : undefined, border: !isEditing ? '1px solid #e0e0e0' : undefined }} />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
            <Stack direction="horizontal" gap={2} className="justify-content-center mt-2 flex-wrap">
              {userRole !== 'Administrator' && !isEditing ? (
                <div className="d-grid gap-2 d-md-block">
                  <Button variant="primary" className="flex-fill py-2 px-4 d-flex align-items-center justify-content-center" onClick={() => setIsEditing(true)}>
                    <i className="fas fa-edit me-2"></i>Edit Profile
                  </Button>
                </div>
              ) : null}
              {userRole !== 'Administrator' && isEditing ? (
                <div className="d-grid gap-2 d-md-block">
                  <Button variant="success" className="flex-fill py-2 px-4 d-flex align-items-center justify-content-center" onClick={handleSave}>
                    <i className="fas fa-save me-2"></i>Save
                  </Button>
                  <Button variant="danger" className="flex-fill py-2 px-4 d-flex align-items-center justify-content-center" onClick={() => setIsEditing(false)}>
                    <i className="fas fa-times me-2"></i>Cancel
                  </Button>
                </div>
              ) : null}
            </Stack>
          </>
        )}
      </Card>
    </Container>
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
    <Container fluid style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Row className="justify-content-center py-5">
        <Col xs={12} md={10} lg={8}>{profileInfoCard}</Col>
      </Row>
    </Container>
  );
}

export default Profile; 