import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  Image
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
    <div className="min-vh-100 bg-light py-5">
      <Container>
        {/* Header */}
        <Row className="justify-content-center text-center mb-5">
          <Col md={6}>
            <div className="d-inline-block p-3 bg-primary bg-opacity-10 rounded-circle mb-3">
              <i className="bi bi-shield-check text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            <h1 className="display-6 fw-bold text-primary mb-2">IPatroller System</h1>
            <p className="text-muted lead">Secure your community with advanced patrol management</p>
          </Col>
        </Row>

        {/* Login Card */}
        <Row className="justify-content-center">
          <Col xs={11} sm={9} md={7} lg={5} xl={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h2 className="h4 text-center mb-4">Welcome Back!</h2>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">Email Address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="border-start-0 ps-0"
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="small fw-medium mb-0">Password</Form.Label>
                      <Link to="/forgot-password" className="small text-primary text-decoration-none">
                        Forgot Password?
                      </Link>
                    </div>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="border-start-0 border-end-0 ps-0"
                        required
                      />
                      <Button
                        variant="light"
                        onClick={() => setShowPassword(!showPassword)}
                        className="border border-start-0"
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''} text-muted`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="Keep me signed in"
                      className="small"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 mb-3 py-2"
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

                  <p className="text-center text-muted small mb-4">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary text-decoration-none">
                      Create Account
                    </Link>
                  </p>

                  <div className="position-relative mb-4">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                      or continue with
                    </span>
                  </div>

                  <Row className="g-3 mb-4">
                    <Col xs={6}>
                      <Button variant="outline-secondary" className="w-100">
                        <i className="bi bi-google me-2"></i>
                        Google
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button variant="outline-secondary" className="w-100">
                        <i className="bi bi-facebook me-2"></i>
                        Facebook
                      </Button>
                    </Col>
                  </Row>

                  <div className="text-center">
                    <p className="text-muted small mb-0">
                      By signing in, you agree to our{' '}
                      <a href="#" className="text-decoration-none">Terms</a>
                      {' '}and{' '}
                      <a href="#" className="text-decoration-none">Privacy Policy</a>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login; 