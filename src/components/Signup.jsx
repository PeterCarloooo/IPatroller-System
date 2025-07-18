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

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { values, handleChange } = useForm({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'patroller'
  });

  const validateForm = () => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (values.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signup(values);
      navigate('/login', {
        state: { message: 'Account created successfully! Please log in.' }
      });
    } catch (err) {
      setError(err.message || 'Failed to create account');
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
          <h1 className="display-4 fw-bold mb-4">Join IPatroller</h1>
          <p className="lead mb-4">
            Be part of our mission to create safer communities through effective patrolling
          </p>
          <div className="d-flex justify-content-center gap-3">
            <div className="text-center">
              <i className="bi bi-person-badge display-6 mb-2"></i>
              <p>Professional Profile</p>
            </div>
            <div className="text-center">
              <i className="bi bi-clock-history display-6 mb-2"></i>
              <p>Flexible Scheduling</p>
            </div>
            <div className="text-center">
              <i className="bi bi-graph-up display-6 mb-2"></i>
              <p>Performance Tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="col-12 col-lg-6 d-flex align-items-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col xs={11} sm={8} md={6} lg={8} xl={6}>
              {/* Mobile Logo */}
              <div className="text-center d-lg-none mb-5">
                <i className="bi bi-shield-check text-primary display-1"></i>
                <h1 className="h3 text-primary mb-4">Join IPatroller</h1>
              </div>

              <h2 className="fw-bold mb-4">Create Your Account</h2>
              <p className="text-muted mb-4">Fill in your details to get started</p>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light">
                          <i className="bi bi-person text-primary"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                          className="py-2"
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        className="py-2"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

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
                  <Form.Label>Phone Number</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-phone text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number"
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
                      placeholder="Create password"
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
                  <Form.Text className="text-muted">
                    Must be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-lock-fill text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="py-2"
                      required
                    />
                    <Button
                      variant="light"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="border"
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Role</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-person-badge text-primary"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      className="py-2"
                      required
                    >
                      <option value="patroller">Patroller</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Administrator</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="terms"
                    required
                    label={
                      <span className="text-muted">
                        I agree to the{' '}
                        <a href="#" className="text-decoration-none">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-decoration-none">Privacy Policy</a>
                      </span>
                    }
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2 mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-center text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                    Sign In
                  </Link>
                </p>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Signup; 