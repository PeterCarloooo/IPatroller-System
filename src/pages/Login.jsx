import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useUserRole } from '../context/UserContext';
import { Container, Card, Form, Button, Alert, Spinner, Stack } from 'react-bootstrap';

function Login() {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Attempt to sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      // 2. Immediately fetch the user's Firestore profile using their UID
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        setError('Your account is not yet registered. Please contact your administrator to register your account.');
        setLoading(false);
        return;
      }

      // 3. Continue with your role logic and navigation
      let role = '';
      if (formData.email === 'admin@admin.com') {
        role = 'Administrator';
      } else {
        role = 'User';
      }
      setUserRole(role);
      if (role === 'Administrator') {
        navigate('/dashboard');
      } else {
        navigate('/user-dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        default:
          setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        padding: 0,
        margin: 0,
        background: 'linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%)',
      }}
    >
      <Card
        className="shadow border-0"
        style={{
          maxWidth: 420,
          width: '100%',
          margin: 'auto',
          borderRadius: '1.5rem',
          background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
        }}
      >
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <Stack direction="vertical" gap={3} className="align-items-center">
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(33,147,176,0.13)',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto',
                boxShadow: '0 2px 8px 0 rgba(33,147,176,0.08)',
              }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
                  alt="Bataan Seal"
                  style={{ width: '54px', height: '54px', objectFit: 'contain' }}
                />
              </div>
              <h2 className="fw-bold mb-1" style={{ letterSpacing: '1px', color: '#2193b0', fontSize: '2.2rem' }}>IPatroller</h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.08rem', fontWeight: 500 }}>Sign in to your account</p>
            </Stack>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 w-100" controlId="loginEmail">
              <Form.Label className="fw-semibold">Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoFocus
                size="lg"
                placeholder="Enter your email"
                style={{ background: '#f5f7fa', border: 'none', borderRadius: '0.7rem' }}
              />
            </Form.Group>
            <Form.Group className="mb-3 w-100" controlId="loginPassword">
              <Form.Label className="fw-semibold">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                size="lg"
                placeholder="Enter your password"
                style={{ background: '#f5f7fa', border: 'none', borderRadius: '0.7rem' }}
              />
            </Form.Group>

            {error && (
              <Alert variant="danger" className="text-center mb-3">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              className="mb-2 w-100 py-2 fw-bold"
              style={{
                borderRadius: '0.9rem',
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
                border: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px 0 rgba(33,147,176,0.08)'
              }}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Signing in...
                </>
              ) : 'Login'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login; 