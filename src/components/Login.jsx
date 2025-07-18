import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Add your login logic here
      console.log('Login attempt:', credentials);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
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
    <Container>
      <h2>Login</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Login'}
        </Button>

        <div className="mt-3">
          <Link to="/signup">Sign up</Link>
        </div>
      </Form>
    </Container>
  );
};

export default Login; 