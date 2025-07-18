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
  FaBars,
  FaTimes,
  FaAngleLeft,
  FaAngleRight
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className="d-flex">
      {/* Mobile Menu Toggle */}
      <Button
        variant="primary"
        className="d-lg-none position-fixed"
        style={{
          top: '1rem',
          left: '1rem',
          zIndex: 1031,
          padding: '0.5rem',
          width: '40px',
          height: '40px'
        }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </Button>

      {/* Sidebar */}
      <div
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}
        style={{
          width: isCollapsed ? '60px' : '250px',
          minHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1030,
          overflowY: 'auto'
        }}
      >
        {/* Logo */}
        <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-light">
          {!isCollapsed && (
            <h5 className="m-0 text-white" style={{ fontSize: '1.1rem' }}>IPatroller System</h5>
          )}
          <Button
            variant="link"
            className={`text-white p-0 d-none d-lg-block toggle-button ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ width: '30px', height: '30px' }}
          >
            {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
          </Button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-bottom border-light">
            <div className="d-flex align-items-center">
              <div className="user-avatar me-2">
                {currentUser?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="text-white">
                <div className="fw-bold">{currentUser?.displayName || 'User'}</div>
                <small className="text-light opacity-75">Admin</small>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="py-2">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`sidebar-item px-3 py-2 d-flex align-items-center ${
                location.pathname === item.path ? 'active' : ''
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="sidebar-icon text-white">
                {item.icon}
              </div>
              {!isCollapsed && <span className="ms-3 text-white">{item.label}</span>}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div
          className="sidebar-item px-3 py-2 d-flex align-items-center mt-auto border-top border-light"
          onClick={handleLogout}
          style={{ marginTop: 'auto' }}
        >
          <div className="sidebar-icon text-white">
            <FaSignOutAlt />
          </div>
          {!isCollapsed && <span className="ms-3 text-white">Logout</span>}
        </div>
      </div>

      {/* Main Content */}
      <div
        className="content-wrapper"
        style={{
          marginLeft: isCollapsed ? '60px' : '250px',
          width: '100%'
        }}
      >
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="position-fixed top-0 left-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.5, zIndex: 1029 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 