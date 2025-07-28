import React, { useState } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Spinner, Alert, Card } from 'react-bootstrap';

function ChangePasswordTest({ isOpen, onClose }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Basic validation
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }

      if (form.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      console.log('User:', user ? user.email : 'No user');

      if (!user) {
        setError('No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('Reauthenticating...');
      const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      console.log('Updating password...');
      await updatePassword(user, form.newPassword);
      
      console.log('Logging password change...');
      await addDoc(collection(db, 'password_changes'), {
        userId: user.uid,
        email: user.email,
        changedAt: new Date()
      });

      setSuccess('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(async () => {
        await signOut(auth);
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect');
      } else {
        setError(err.message || 'Failed to change password');
      }
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.6)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1050,
      backdropFilter: 'blur(5px)'
    }}>
      <Card style={{ 
        width: '450px', 
        maxWidth: '90vw',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}>
        <Card.Header className="border-0 pb-0" style={{ background: 'transparent' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle" style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              <i className="fas fa-key text-white"></i>
            </div>
            <div>
              <h5 className="fw-bold mb-1">Change Password</h5>
              <p className="text-muted mb-0 small">Update your account password for enhanced security</p>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="pt-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold mb-2">
                <i className="fas fa-lock me-2" style={{ color: '#667eea' }}></i>
                Current Password
              </Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleInputChange}
                required
                className="rounded-3"
                style={{
                  border: '2px solid rgba(102, 126, 234, 0.1)',
                  padding: '0.75rem 1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold mb-2">
                <i className="fas fa-key me-2" style={{ color: '#28a745' }}></i>
                New Password
              </Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleInputChange}
                required
                className="rounded-3"
                style={{
                  border: '2px solid rgba(102, 126, 234, 0.1)',
                  padding: '0.75rem 1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold mb-2">
                <i className="fas fa-check-circle me-2" style={{ color: '#20c997' }}></i>
                Confirm New Password
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleInputChange}
                required
                className="rounded-3"
                style={{
                  border: '2px solid rgba(102, 126, 234, 0.1)',
                  padding: '0.75rem 1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Group>

            {error && (
              <Alert variant="danger" className="rounded-3 border-0" style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="rounded-3 border-0" style={{ background: 'rgba(40, 167, 69, 0.1)', color: '#28a745' }}>
                <i className="fas fa-check-circle me-2"></i>
                {success}
              </Alert>
            )}

            <div className="d-flex gap-3 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handleClose} 
                disabled={loading}
                className="flex-fill rounded-pill"
                style={{
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  color: '#667eea',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
                className="flex-fill rounded-pill"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Changing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ChangePasswordTest; 