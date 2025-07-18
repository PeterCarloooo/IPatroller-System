import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      // Add your signup logic here
      console.log('Signup attempt:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
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

  return (
    <Container>
      <h2>Sign Up</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Sign Up'}
        </Button>

        <div className="mt-3">
          <Link to="/login">Login</Link>
        </div>
      </Form>
    </Container>
  );
};

export default Signup; 