import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Image } from 'react-bootstrap';
import authService from '../services/authService';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if username is available
      const isAvailable = await authService.checkUsernameAvailable(formData.username);
      if (!isAvailable) {
        setError('Username is already taken');
        setIsLoading(false);
        return;
      }

      // Create the account
      await authService.signup(formData.username, formData.password);
      
      // Show success message
      alert('Account created successfully! Please check your email for verification.');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          <p style={{ color: '#666666' }}>Create your account</p>
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
              value={formData.username}
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
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              style={{ padding: '0.75rem' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              style={{ padding: '0.75rem' }}
            />
          </Form.Group>

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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </Form>

        <div className="text-center">
          <p style={{ color: '#666666', marginBottom: '0.5rem' }}>Already have an account?</p>
          <Button
            as={Link}
            to="/login"
            className="w-100"
            style={{ 
              padding: '0.75rem',
              backgroundColor: 'transparent',
              border: '1px solid #0066ff',
              color: '#0066ff',
              borderRadius: '4px'
            }}
          >
            Sign In
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Signup; 