import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
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
      {/* Mobile Menu Toggle */}
      <Button
        variant="primary"
        className="mobile-menu-toggle d-lg-none"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <FaBars />
      </Button>

      {/* Side Navigation */}
      <div className={`side-nav ${isMobileOpen ? 'open' : ''}`}>
        <div className="side-nav-header">
          <h1 className="app-title">IPatroller System</h1>
        </div>
        
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

        <div className="side-nav-footer">
          <Button 
            variant="outline-primary" 
            className="logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </Button>
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