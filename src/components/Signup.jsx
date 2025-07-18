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
    role: 'patroller' // default role
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
    <Container fluid className="vh-100 bg-light">
      <Row className="h-100 align-items-center justify-content-center">
        <Col xs={11} sm={9} md={7} lg={5} xl={4}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4 p-sm-5">
              {/* Logo and Title */}
              <div className="text-center mb-4">
                <i className="bi bi-shield-check text-primary" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-2 mb-0 text-primary">Create Account</h4>
                <p className="text-muted">Join IPatroller System</p>
              </div>

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
                          <i className="bi bi-person text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          placeholder="First name"
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
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

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
                  <Form.Label>Phone Number</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <i className="bi bi-phone text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number"
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
                      placeholder="Create password"
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
                      <i className="bi bi-lock-fill text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
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
                      <i className="bi bi-person-badge text-muted"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="role"
                      value={values.role}
                      onChange={handleChange}
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
                    label={
                      <span className="text-muted">
                        I agree to the{' '}
                        <a href="#" className="text-primary text-decoration-none">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary text-decoration-none">Privacy Policy</a>
                      </span>
                    }
                    required
                  />
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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Sign In
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup; 