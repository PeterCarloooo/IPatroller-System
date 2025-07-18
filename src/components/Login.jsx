import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Image, Card, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Get the return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(credentials.username, credentials.password);
      // Navigate to the return URL after successful login
      navigate(from, { replace: true });
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Card className="shadow-lg border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body className="p-4">
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
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaUser className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  style={{ padding: '0.75rem' }}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaLock className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  style={{ padding: '0.75rem' }}
                />
                <Button 
                  variant="light" 
                  onClick={togglePasswordVisibility}
                  style={{ borderLeft: 'none' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <p style={{ color: '#666666', marginBottom: '0.5rem' }}>Don't have an account?</p>
              <Link 
                to="/signup"
                className="btn btn-outline-primary w-100"
                style={{ 
                  padding: '0.75rem',
                  borderRadius: '4px'
                }}
              >
                Create Account
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login; 