import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Add CSS animations
const loginStyles = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(10px, -10px);
    }
    50% {
      transform: translate(-5px, 5px);
    }
    75% {
      transform: translate(-10px, -5px);
    }
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = loginStyles;
document.head.appendChild(styleSheet);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check for existing IPatroller data
      const existingData = localStorage.getItem('ipatrollerData');
      let hasData = false;
      let monthCount = 0;
      
      if (existingData) {
        try {
          const parsedData = JSON.parse(existingData);
          monthCount = Object.keys(parsedData).length;
          hasData = monthCount > 0;
        } catch (error) {
          console.log('No valid IPatroller data found');
        }
      }
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        
        // Show data restoration notification if data exists
        if (hasData) {
          setTimeout(() => {
            alert(`🎉 Welcome back!\n\n✅ Your IPatroller data has been restored:\n• ${monthCount} month(s) of data available\n• All Excel imports preserved\n• All daily counts maintained\n\nYour data is ready to use!`);
          }, 500);
        }
        
        // Navigate based on role
        if (role === 'Administrator') {
          navigate('/dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        setError('User data not found. Please contact administrator.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'float 20s ease-in-out infinite'
      }} />
      
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <div className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: '450px', minHeight: '80vh' }}>
          {/* Login Card */}
          <Card className="shadow-lg border-0 rounded-4" style={{ 
            width: '100%', 
            margin: 0, 
            borderRadius: '20px', 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideUp 0.6s ease-out'
          }}>
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                {/* Logo and Header */}
                <div 
                  className="d-flex align-items-center justify-content-center mb-4"
                  style={{
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  <div style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    border: '3px solid rgba(255, 255, 255, 0.8)'
                  }}>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
                      alt="Bataan Seal"
                      style={{ 
                        width: 70, 
                        height: 70, 
                        objectFit: 'contain',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                </div>
                <h2 className="fw-bold mb-2" style={{ 
                  color: '#2c3e50',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '2.2rem'
                }}>IPatroller</h2>
                <p className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: 500 }}>Province of Bataan</p>
                <p className="text-muted mt-2" style={{ fontSize: '0.95rem' }}>Sign in to your account</p>
              </div>

              {error && (
                <Alert variant="danger" className="rounded-4 mb-4" style={{
                  background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                  border: '1px solid #f5c6cb',
                  color: '#721c24',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.15)'
                }}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-envelope me-2" style={{ color: '#667eea' }}></i>Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-4 border-0 shadow-sm"
                    style={{ 
                      padding: '1rem 1.25rem',
                      background: 'rgba(248, 249, 250, 0.8)',
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      fontSize: '1rem',
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
                  <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-lock me-2" style={{ color: '#667eea' }}></i>Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-4 border-0 shadow-sm"
                      style={{ 
                        padding: '1rem 1.25rem',
                        paddingRight: '3.5rem',
                        background: 'rgba(248, 249, 250, 0.8)',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem',
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
                    <Button
                      type="button"
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y border-0 p-0 me-3"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ 
                        background: 'none',
                        color: '#6c757d',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.color = '#667eea'}
                      onMouseOut={e => e.currentTarget.style.color = '#6c757d'}
                    >
                      <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`} style={{ fontSize: '1.1rem' }}></i>
                    </Button>
                  </div>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="remember-me"
                    label="Remember me"
                    className="text-muted"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <Button
                    variant="link"
                    className="text-decoration-none p-0"
                    onClick={() => setShowForgotPassword(true)}
                    style={{ 
                      color: '#667eea',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => e.currentTarget.style.color = '#5a6fd8'}
                    onMouseOut={e => e.currentTarget.style.color = '#667eea'}
                  >
                    Forgot Password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 rounded-4 fw-bold py-3"
                  disabled={loading}
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
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
                  {/* Button shine effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s ease',
                    pointerEvents: 'none'
                  }} 
                  onMouseOver={e => e.currentTarget.style.left = '100%'}
                  />
                  
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-white small mb-0" style={{ 
              fontSize: '0.9rem',
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              © 2025 Province of Bataan. All rights reserved.
            </p>
          </div>
        </div>
      </Container>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ 
          background: 'rgba(0,0,0,0.6)', 
          zIndex: 1050,
          backdropFilter: 'blur(10px)'
        }}>
          <Card className="border-0 shadow-lg rounded-4" style={{ 
            maxWidth: '450px', 
            width: '90%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ 
                  width: 70, 
                  height: 70, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                }}>
                  <i className="fas fa-key" style={{ fontSize: '1.8rem' }}></i>
                </div>
                <h4 className="fw-bold mb-2" style={{ 
                  color: '#2c3e50',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Forgot Password?</h4>
                <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>Enter your email to reset your password</p>
              </div>

              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                    <i className="fas fa-envelope me-2" style={{ color: '#667eea' }}></i>Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    className="rounded-4 border-0 shadow-sm"
                    style={{ 
                      padding: '1rem 1.25rem',
                      background: 'rgba(248, 249, 250, 0.8)',
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      fontSize: '1rem',
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

                <div className="d-flex gap-3">
                  <Button
                    variant="light"
                    className="flex-fill rounded-4 py-2"
                    onClick={() => setShowForgotPassword(false)}
                    style={{
                      background: 'rgba(248, 249, 250, 0.8)',
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      color: '#6c757d',
                      fontWeight: 500,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(248, 249, 250, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-fill rounded-4 py-2"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: 500,
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    <i className="fas fa-paper-plane me-2"></i>
                    Send Reset Link
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Login; 