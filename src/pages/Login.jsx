import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useUserRole } from '../context/UserContext';
import { Container, Card, Form, Button, Alert, Spinner, Stack, Modal } from 'react-bootstrap';
import { sendPasswordResetEmail } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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

      // Get geolocation and update status/location
      async function reverseGeocode(lat, lon) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await response.json();
          if (data.address && data.address.city) {
            return `${data.address.city}, Bataan`;
          }
          return data.display_name || 'Unknown Location';
        } catch (e) {
          return 'Unknown Location';
        }
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = await reverseGeocode(latitude, longitude);
          await updateDoc(doc(db, 'users', userCredential.user.uid), {
            status: 'Active',
            location: locationString
          });
          console.log('Status set to Active with location:', locationString);
        }, async (error) => {
          await updateDoc(doc(db, 'users', userCredential.user.uid), { status: 'Active' });
          console.log('Status set to Active (no location permission)');
        });
      } else {
        await updateDoc(doc(db, 'users', userCredential.user.uid), { status: 'Active' });
        console.log('Status set to Active (no geolocation support)');
      }

      // 4. Continue with your role logic and navigation
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSuccess('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setForgotError('Failed to send reset email. Please check the email address.');
    } finally {
      setForgotLoading(false);
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
                  style={{
                    width: 78,
                    height: 78,
                    objectFit: 'contain',
                    borderRadius: '50%',
                    background: '#fff',
                    border: '1px solid #fff',
                    boxShadow: '0 1px 4px 0 rgba(33,147,176,0.10)'
                  }}
                />
              </div>
              <h2 className="fw-bold mb-1" style={{ letterSpacing: '1px', color: '#2193b0', fontSize: '2.2rem' }}>IPatroller</h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.08rem', fontWeight: 500 }}>Sign in to your account</p>
            </Stack>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 w-100" controlId="loginEmail">
              <Form.Label className="fw-semibold">Email address</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  size="lg"
                  placeholder="Email address"
                  style={{
                    background: '#f5f7fa',
                    border: 'none',
                    borderRadius: '0.7rem',
                    paddingLeft: '2.7rem',
                  }}
                />
                <i className="bi bi-envelope position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ fontSize: '1.1em' }}></i>
              </div>
            </Form.Group>
            <Form.Group className="mb-3 w-100 position-relative" controlId="loginPassword">
              <Form.Label className="fw-semibold">Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  size="lg"
                  placeholder="Password"
                  style={{
                    background: '#f5f7fa',
                    border: 'none',
                    borderRadius: '0.7rem',
                    paddingLeft: '2.7rem',
                    paddingRight: '2.5rem'
                  }}
                />
                <i className="bi bi-lock position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ fontSize: '1.1em' }}></i>
                <Button
                  variant="link"
                  tabIndex={-1}
                  className="position-absolute top-50 end-0 translate-middle-y px-2 py-0 border-0"
                  style={{ color: '#2193b0', fontSize: '1.2em', textDecoration: 'none' }}
                  onClick={e => { e.preventDefault(); setShowPassword(v => !v); }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                </Button>
              </div>
              <div className="text-end mt-1">
                <Button variant="link" className="p-0 m-0 align-baseline text-decoration-none" style={{ fontSize: '0.98em', color: '#2193b0' }} onClick={() => setShowForgotModal(true)} tabIndex={0} aria-label="Forgot password?">
                  Forgot password?
                </Button>
              </div>
            </Form.Group>

            {error && (
              <Alert variant="danger" className="text-center mb-3">
                {error}
              </Alert>
            )}

            <div className="d-grid gap-2 d-md-block">
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
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </>
                )}
              </Button>
            </div>
          </Form>

          {/* Forgot Password Modal */}
          <Modal show={showForgotModal} onHide={() => setShowForgotModal(false)} centered contentClassName="border-0 rounded-4 shadow-lg">
            <Modal.Header closeButton className="border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
              <Modal.Title className="fw-bold">Reset Password</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '1.2rem' }}>
              <Form onSubmit={handleForgotPassword}>
                <Form.Group className="mb-3" controlId="forgotEmail">
                  <Form.Label>Enter your email address</Form.Label>
                  <Form.Control
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    placeholder="Email address"
                    autoFocus
                  />
                </Form.Group>
                {forgotError && <Alert variant="danger" className="mb-2">{forgotError}</Alert>}
                {forgotSuccess && <Alert variant="success" className="mb-2">{forgotSuccess}</Alert>}
                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary" disabled={forgotLoading} className="fw-bold">
                    {forgotLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                    Send Reset Link
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login; 