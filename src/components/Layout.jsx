import React, { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Debounced navigation to prevent throttling
  const handleNavigation = useCallback((path) => {
    setTimeout(() => {
      navigate(path);
    }, 100);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand onClick={() => handleNavigation('/dashboard')} style={{ cursor: 'pointer' }}>
            IPatroller System
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {currentUser && (
                <>
                  <Nav.Link onClick={() => handleNavigation('/dashboard')}>Dashboard</Nav.Link>
                  <Nav.Link onClick={() => handleNavigation('/ipatroller')}>IPatroller</Nav.Link>
                  <Nav.Link onClick={() => handleNavigation('/illegals')}>Illegals</Nav.Link>
                  <Nav.Link onClick={() => handleNavigation('/command-center')}>Command Center</Nav.Link>
                  <Nav.Link onClick={() => handleNavigation('/report')}>Report</Nav.Link>
                  <Nav.Link onClick={() => handleNavigation('/setup')}>Setup</Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              {currentUser ? (
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button variant="outline-light" onClick={() => handleNavigation('/login')}>
                  Login
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Outlet />
      </Container>
    </>
  );
};

export default Layout; 