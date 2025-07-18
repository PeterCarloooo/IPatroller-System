import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  InputGroup
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import LoadingSpinner from './common/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { values, handleChange } = useForm({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-vh-100 d-flex">
      {/* Left Side - Image */}
      <div className="d-none d-lg-flex col-lg-6 bg-primary position-relative">
        <div className="position-absolute top-50 start-50 translate-middle text-white text-center w-75">
          <i className="bi bi-shield-check display-1 mb-4"></i>
          <h1 className="display-4 fw-bold mb-4">IPatroller System</h1>
          <p className="lead mb-4">
            Empowering communities through efficient and effective patrol management
          </p>
          <div className="d-flex justify-content-center gap-3">
            <div className="text-center">
              <i className="bi bi-graph-up display-6 mb-2"></i>
              <p>Real-time Monitoring</p>
            </div>
            <div className="text-center">
              <i className="bi bi-shield-lock display-6 mb-2"></i>
              <p>Enhanced Security</p>
            </div>
            <div className="text-center">
              <i className="bi bi-people display-6 mb-2"></i>
              <p>Team Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="col-12 col-lg-6 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={11} sm={8} md={6} lg={8} xl={6}>
              {/* Mobile Logo */}
              <div className="text-center d-lg-none mb-5">
                <i className="bi bi-shield-check text-primary display-1"></i>
                <h1 className="h3 text-primary mb-4">IPatroller System</h1>
              </div>

              <h2 className="fw-bold mb-4">Welcome Back!</h2>
              <p className="text-muted mb-4">Please sign in to your account</p>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-envelope text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="py-2"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-lock text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="py-2"
                      required
                    />
                    <Button
                      variant="light"
                      onClick={() => setShowPassword(!showPassword)}
                      className="border"
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    className="text-muted"
                  />
                  <Link 
                    to="/forgot-password" 
                    className="text-primary text-decoration-none"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2 mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <p className="text-center text-muted">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary text-decoration-none fw-semibold">
                    Create Account
                  </Link>
                </p>
              </Form>

              <div className="mt-5">
                <div className="d-flex align-items-center mb-4">
                  <hr className="flex-grow-1" />
                  <span className="mx-3 text-muted">Or continue with</span>
                  <hr className="flex-grow-1" />
                </div>

                <div className="d-grid gap-2">
                  <Button variant="outline-dark" className="py-2">
                    <i className="bi bi-google me-2"></i>
                    Sign in with Google
                  </Button>
                  <Button variant="outline-dark" className="py-2">
                    <i className="bi bi-facebook me-2"></i>
                    Sign in with Facebook
                  </Button>
                </div>
              </div>

              <p className="text-center text-muted small mt-5">
                By signing in, you agree to our{' '}
                <a href="#" className="text-decoration-none">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-decoration-none">Privacy Policy</a>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Login; 