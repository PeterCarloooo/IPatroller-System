import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Form, Button, Image, Card, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup = () => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
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

    // Validate input
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(formData.username, formData.password);
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

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
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
            <p style={{ color: '#666666' }}>Create your account</p>
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
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  style={{ padding: '0.75rem' }}
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Username can only contain letters, numbers, and underscores
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaLock className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  style={{ padding: '0.75rem' }}
                />
                <Button 
                  variant="light" 
                  onClick={() => togglePasswordVisibility('password')}
                  style={{ borderLeft: 'none' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Password must be at least 6 characters long
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaLock className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  style={{ padding: '0.75rem' }}
                />
                <Button 
                  variant="light" 
                  onClick={() => togglePasswordVisibility('confirm')}
                  style={{ borderLeft: 'none' }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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