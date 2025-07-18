import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Image, Card, InputGroup } from 'react-bootstrap';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signup(credentials.username, credentials.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
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
            }}>Create Account</h4>
            <p style={{ color: '#666666' }}>Sign up to join IPatroller System</p>
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
                  <PersonIcon className="text-primary" />
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
                  <LockIcon className="text-primary" />
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
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ borderLeft: 'none' }}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <LockIcon className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={credentials.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  style={{ padding: '0.75rem' }}
                />
                <Button 
                  variant="light" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ borderLeft: 'none' }}
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center">
              <p style={{ color: '#666666', marginBottom: '0.5rem' }}>Already have an account?</p>
              <Link 
                to="/login"
                className="btn btn-outline-primary w-100"
                style={{ 
                  padding: '0.75rem',
                  borderRadius: '4px'
                }}
              >
                Sign In
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup; 