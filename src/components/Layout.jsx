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
  FaTimes
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleNavigation = useCallback((path) => {
    navigate(path);
    if (window.innerWidth < 992) {
      setIsSidebarOpen(false);
    }
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
    <div className="layout-container">
      {/* Sidebar Toggle Button */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img 
            src="/src/assets/bataan-logo.png" 
            alt="Bataan Logo" 
            className="sidebar-logo"
          />
          <h1 className="sidebar-title">IPatroller System</h1>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Button 
            variant="outline-light" 
            className="logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </main>

      {/* Mobile Backdrop */}
      {isSidebarOpen && window.innerWidth < 992 && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 