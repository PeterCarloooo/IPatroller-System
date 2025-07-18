import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, Navbar } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaUserShield,
  FaExclamationTriangle,
  FaVideo,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavigation = useCallback((path) => {
    navigate(path);
    setIsMobileOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/ipatroller', icon: <FaUserShield />, label: 'IPatroller' },
    { path: '/illegals', icon: <FaExclamationTriangle />, label: 'Illegals' },
    { path: '/command-center', icon: <FaVideo />, label: 'Command Center' },
    { path: '/report', icon: <FaChartBar />, label: 'Report' },
    { path: '/setup', icon: <FaCog />, label: 'Setup' }
  ];

  if (!currentUser) {
    return <Outlet />;
  }

  return (
    <div className="layout-wrapper">
      {/* Top Header */}
      <Navbar className="top-header" variant="dark" expand="lg">
        <Container fluid className="px-4">
          <div className="d-flex align-items-center">
            <Button
              variant="link"
              className="d-lg-none me-3 p-0 text-white"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              <FaBars size={24} />
            </Button>
            <Navbar.Brand className="m-0">IPatroller System</Navbar.Brand>
          </div>
          <Button 
            variant="outline-light" 
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Container>
      </Navbar>

      {/* Side Navigation */}
      <div className={`side-nav ${isMobileOpen ? 'open' : ''}`}>
        <div className="nav-items">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 