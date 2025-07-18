import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Modal,
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
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(values.username, values.password);
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
      style={{
        background: 'linear-gradient(135deg, #0061f2 0%, #6900f2 100%)',
        padding: '1rem'
      }}>
      <div className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: 'url("https://source.unsplash.com/featured/?patrol,security") center/cover',
          opacity: '0.1'
        }}
      />
      
      <Modal show={true} centered dialogClassName="border-0 shadow-lg" style={{ background: 'transparent' }}>
        <Modal.Body className="p-0">
          <Row className="g-0">
            {/* Left Side - Image */}
            <Col md={5} className="d-none d-md-block">
              <div className="h-100 position-relative" style={{ minHeight: '500px' }}>
                <div className="position-absolute w-100 h-100"
                  style={{
                    background: 'url("https://source.unsplash.com/featured/?patrol,security") center/cover',
                    clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'
                  }}
                />
                <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center text-white p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,97,242,0.9) 0%, rgba(105,0,242,0.9) 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'
                  }}>
                  <h3 className="display-6 fw-bold mb-3">IPatroller System</h3>
                  <p className="lead mb-4">Secure your community with advanced patrol management</p>
                  <div className="d-flex gap-3 mb-4">
                    <div>
                      <div className="bg-white bg-opacity-25 rounded-circle p-3 mb-2">
                        <i className="bi bi-shield-check text-white fs-4"></i>
                      </div>
                      <p className="small">Real-time Monitoring</p>
                    </div>
                    <div>
                      <div className="bg-white bg-opacity-25 rounded-circle p-3 mb-2">
                        <i className="bi bi-graph-up text-white fs-4"></i>
                      </div>
                      <p className="small">Performance Tracking</p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Side - Login Form */}
            <Col md={7}>
              <div className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="d-inline-block bg-primary bg-opacity-10 rounded-circle p-3 mb-3">
                    <i className="bi bi-shield-check text-primary fs-3"></i>
                  </div>
                  <h4 className="fw-bold">Welcome Back!</h4>
                  <p className="text-muted small">Sign in to your account</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">Username</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-person text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
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
                    size="lg"
                    className="w-100 mb-3"
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

                  <p className="text-center text-muted small mb-0">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary text-decoration-none fw-medium">
                      Create Account
                    </Link>
                  </p>
                </Form>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Login; 