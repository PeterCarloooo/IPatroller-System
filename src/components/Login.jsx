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
    <Container fluid className="vh-100 bg-light">
      <Row className="h-100 align-items-center justify-content-center">
        <Col xs={11} sm={9} md={7} lg={5} xl={4}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4 p-sm-5">
              {/* Logo and Title */}
              <div className="text-center mb-4">
                <i className="bi bi-shield-check text-primary" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-2 mb-0 text-primary">IPatroller System</h4>
                <p className="text-muted">Sign in to your account</p>
              </div>

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
                      <i className="bi bi-envelope text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-lock text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
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

                <Form.Group className="mb-4">
                  <Row className="align-items-center">
                    <Col>
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        className="text-muted"
                      />
                    </Col>
                    <Col xs="auto">
                      <Link to="/forgot-password" className="text-primary text-decoration-none">
                        Forgot Password?
                      </Link>
                    </Col>
                  </Row>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-4 py-2"
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

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary text-decoration-none">
                      Create Account
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Additional Info */}
          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary text-decoration-none">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-primary text-decoration-none">Privacy Policy</a>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 