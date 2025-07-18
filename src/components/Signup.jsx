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
    username: '',
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
      
      <Modal show={true} centered size="lg" dialogClassName="border-0 shadow-lg" style={{ background: 'transparent' }}>
        <Modal.Body className="p-0">
          <Row className="g-0">
            {/* Left Side - Image */}
            <Col md={5} className="d-none d-md-block">
              <div className="h-100 position-relative" style={{ minHeight: '600px' }}>
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
                  <h3 className="display-6 fw-bold mb-3">Join IPatroller</h3>
                  <p className="lead mb-4">Be part of our mission to create safer communities</p>
                  <div className="d-flex gap-3 mb-4">
                    <div>
                      <div className="bg-white bg-opacity-25 rounded-circle p-3 mb-2">
                        <i className="bi bi-shield-check text-white fs-4"></i>
                      </div>
                      <p className="small">Professional Profile</p>
                    </div>
                    <div>
                      <div className="bg-white bg-opacity-25 rounded-circle p-3 mb-2">
                        <i className="bi bi-clock-history text-white fs-4"></i>
                      </div>
                      <p className="small">Flexible Scheduling</p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Side - Signup Form */}
            <Col md={7}>
              <div className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="d-inline-block bg-primary bg-opacity-10 rounded-circle p-3 mb-3">
                    <i className="bi bi-shield-check text-primary fs-3"></i>
                  </div>
                  <h4 className="fw-bold">Create Your Account</h4>
                  <p className="text-muted small">Fill in your details to get started</p>
                </div>

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
                    <Form.Label className="small fw-medium">Username</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-person-badge text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
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

                  <p className="text-center text-muted small mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Sign In
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

export default Signup; 