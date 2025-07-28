import React, { useState } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Spinner, Alert, Card } from 'react-bootstrap';

function ChangePassword({ isOpen, onClose }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
    
    // Calculate password strength for new password
    if (name === 'newPassword') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strength++;
      
      if (strength < 3) setPasswordStrength('weak');
      else if (strength < 5) setPasswordStrength('medium');
      else setPasswordStrength('strong');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Change password form submitted');
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const password = form.newPassword;
      
      // Validation
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
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      
      if (!/[a-z]/.test(password)) {
        setError('Password must contain at least one lowercase letter.');
        setLoading(false);
        return;
      }
      
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter.');
        setLoading(false);
        return;
      }
      
      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number.');
        setLoading(false);
        return;
      }
      
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setError('Password must contain at least one special character.');
        setLoading(false);
        return;
      }
      
      // Firebase operations
      const user = auth.currentUser;
      console.log('Current user:', user ? user.email : 'No user');
      if (!user) {
        setError('No authenticated user found. Please log in again.');
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      console.log('Attempting to reauthenticate user...');
      const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('Reauthentication successful, updating password...');
      await updatePassword(user, form.newPassword);
      console.log('Password updated successfully');
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
      }, 1500);
    } catch (err) {
      console.error('Change password error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.');
      } else {
        setError(err.message || 'Failed to change password. Please try again.');
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
    <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
        <Card className="shadow-sm border-0 rounded-4" style={{ borderRadius: '1rem', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <div className="modal-header border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
            <h5 className="modal-title d-flex align-items-center fw-bold">
              <i className="fas fa-shield-alt me-2 text-primary" style={{ fontSize: '1.3rem' }} />
              Change Password
            </h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>
          <Form onSubmit={handleSubmit} autoComplete="off">
            <div className="modal-body pt-3 pb-4 px-4">
              <div className="mb-4 p-3 bg-light rounded-3">
                <p className="text-muted small mb-2 fw-bold">Password Requirements:</p>
                <ul className="text-muted small mb-0" style={{ paddingLeft: '1.2rem' }}>
                  <li>At least 8 characters long</li>
                  <li>Contains at least one lowercase letter</li>
                  <li>Contains at least one uppercase letter</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character (!@#$%^&*)</li>
                </ul>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Current Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showCurrent ? 'text' : 'password'}
                    className="form-control-lg rounded-3"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    className="border-0 bg-transparent input-group-text"
                    tabIndex={-1}
                    style={{ color: '#888', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    <i className={`fas fa-eye${showCurrent ? '-slash' : ''}`}></i>
                  </Button>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">New Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showNew ? 'text' : 'password'}
                    className="form-control-lg rounded-3"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    className="border-0 bg-transparent input-group-text"
                    tabIndex={-1}
                    style={{ color: '#888', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                    onClick={() => setShowNew((v) => !v)}
                  >
                    <i className={`fas fa-eye${showNew ? '-slash' : ''}`}></i>
                  </Button>
                </div>
                {form.newPassword && (
                  <div className="mt-2">
                    <small className={`fw-semibold ${
                      passwordStrength === 'weak' ? 'text-danger' : 
                      passwordStrength === 'medium' ? 'text-warning' : 
                      'text-success'
                    }`}>
                      Password Strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </small>
                  </div>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control-lg rounded-3"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    className="border-0 bg-transparent input-group-text"
                    tabIndex={-1}
                    style={{ color: '#888', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    <i className={`fas fa-eye${showConfirm ? '-slash' : ''}`}></i>
                  </Button>
                </div>
              </Form.Group>
              {error && <Alert variant="danger" className="text-center mb-3">{error}</Alert>}
              {success && <Alert variant="success" className="text-center mb-3">{success}</Alert>}
              {error === 'No authenticated user found. Please log in again.' && (
                <Button variant="primary" className="mt-2" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              )}
            </div>
            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <Button type="button" variant="secondary" className="px-4 py-2 rounded-3" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="px-4 py-2 rounded-3 ms-2" disabled={loading}>
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
        </Card>
      </div>
    </div>
  );
}

export default ChangePassword; 