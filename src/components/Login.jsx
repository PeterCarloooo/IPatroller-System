import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Image } from 'react-bootstrap';

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
      // Add your login logic here
      console.log('Login attempt:', credentials);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.');
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

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="bg-white p-4 rounded shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <Image 
            src="/favicon.svg"
            alt="IPatroller Logo"
            style={{ width: '120px', height: 'auto', marginBottom: '1rem' }}
          />
          <h4 style={{ color: '#0066ff', marginBottom: '0.5rem' }}>IPatroller System</h4>
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

          <Button 
            type="submit" 
            className="w-100"
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
      </div>
    </Container>
  );
};

export default Login; 