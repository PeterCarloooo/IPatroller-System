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
    <div className="min-vh-100 bg-light py-5">
      <Container>
        {/* Header */}
        <Row className="justify-content-center text-center mb-5">
          <Col md={6}>
            <div className="d-inline-block p-3 bg-primary bg-opacity-10 rounded-circle mb-3">
              <i className="bi bi-shield-check text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            <h1 className="display-6 fw-bold text-primary mb-2">Join IPatroller</h1>
            <p className="text-muted lead">Create your account and start patrolling today</p>
          </Col>
        </Row>

        {/* Signup Card */}
        <Row className="justify-content-center">
          <Col xs={11} sm={9} md={7} lg={5} xl={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h2 className="h4 text-center mb-4">Create Your Account</h2>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label className="small fw-medium">First Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <i className="bi bi-person text-muted"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                            className="border-start-0 ps-0"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label className="small fw-medium">Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

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

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">Phone Number</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-phone text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="phoneNumber"
                        value={values.phoneNumber}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="border-start-0 ps-0"
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        placeholder="Create password"
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
                    <Form.Text className="text-muted small">
                      Must be at least 6 characters long
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">Confirm Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-lock-fill text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className="border-start-0 border-end-0 ps-0"
                        required
                      />
                      <Button
                        variant="light"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="border border-start-0"
                      >
                        <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''} text-muted`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-medium">Role</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-person-badge text-muted"></i>
                      </InputGroup.Text>
                      <Form.Select
                        name="role"
                        value={values.role}
                        onChange={handleChange}
                        className="border-start-0 ps-0"
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
                        <span className="small">
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
                    className="w-100 mb-3 py-2"
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

                  <p className="text-center text-muted small mb-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Sign In
                    </Link>
                  </p>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup; 