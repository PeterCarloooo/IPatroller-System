import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Image } from 'react-bootstrap';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Attempt to login
      const user = await authService.login(credentials.username, credentials.password);
      
      // Check if email is verified
      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        return;
      }

      // Successful login
      console.log('Login successful:', user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleForgotPassword = async () => {
    if (!credentials.username) {
      setError('Please enter your username to reset password');
      return;
    }

    try {
      await authService.sendPasswordReset(credentials.username);
      alert('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email');
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="bg-white p-4 rounded shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <Image 
            src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
            alt="Bataan Seal"
            style={{ 
              width: '120px', 
              height: 'auto', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
          <h4 style={{ 
            color: '#003875', 
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>IPatroller System</h4>
          <p style={{ color: '#666666' }}>Sign in to start your session</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Username"
              required
              style={{ padding: '0.75rem' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              required
              style={{ padding: '0.75rem' }}
            />
          </Form.Group>

          <div className="mb-3 text-end">
            <Button
              variant="link"
              onClick={handleForgotPassword}
              className="p-0"
              style={{ color: '#0066ff', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Forgot Password?
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-100 mb-3"
            style={{ 
              padding: '0.75rem',
              backgroundColor: '#0066ff',
              border: 'none',
              borderRadius: '4px'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        <div className="text-center">
          <p style={{ color: '#666666', marginBottom: '0.5rem' }}>Don't have an account?</p>
          <Button
            as={Link}
            to="/signup"
            className="w-100"
            style={{ 
              padding: '0.75rem',
              backgroundColor: 'transparent',
              border: '1px solid #0066ff',
              color: '#0066ff',
              borderRadius: '4px'
            }}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Login; 