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
      background: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1050
    }}>
      <Card style={{ width: '400px', maxWidth: '90vw' }}>
        <Card.Header>
          <h5 className="mb-0">Change Password (Test)</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
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