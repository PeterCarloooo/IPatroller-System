import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Image } from 'react-bootstrap';
import { generateCaptcha } from '../utils/common';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    captchaInput: ''
  });
  const [captcha, setCaptcha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha(6);
    setCaptcha(newCaptcha);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (credentials.captchaInput.toUpperCase() !== captcha) {
      setError('Invalid CAPTCHA. Please try again.');
      refreshCaptcha();
      setCredentials(prev => ({ ...prev, captchaInput: '' }));
      return;
    }

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
            style={{ width: '120px', marginBottom: '1rem' }}
          />
          <h4 className="text-primary mb-3">IPatroller System</h4>
          <p className="text-muted">Sign in to start your session</p>
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
              className="py-2"
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
              className="py-2"
            />
          </Form.Group>

          <div className="mb-3">
            <label className="d-block mb-2">Security Check</label>
            <div className="border p-2 mb-2 bg-light text-center">
              <span style={{ 
                fontFamily: 'monospace',
                fontSize: '24px',
                letterSpacing: '3px',
                userSelect: 'none'
              }}>
                {captcha}
              </span>
            </div>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                name="captchaInput"
                value={credentials.captchaInput}
                onChange={handleChange}
                placeholder="Enter text above"
                required
                className="py-2"
              />
              <Button 
                variant="outline-secondary" 
                onClick={refreshCaptcha}
                type="button"
              >
                ↻
              </Button>
            </div>
            <div className="mt-1">
              <small>
                <a href="#" onClick={(e) => { e.preventDefault(); refreshCaptcha(); }}>
                  Can't read this? Try Another
                </a>
              </small>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-100 py-2" 
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