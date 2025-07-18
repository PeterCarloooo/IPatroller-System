import React, { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Videocam as VideocamIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import './Layout.css';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check authentication on mount and location change
  useEffect(() => {
    if (!currentUser) {
      // Save the current location to redirect back after login
      navigate('/login', { state: { from: location } });
    }
  }, [currentUser, location, navigate]);

  const handleNavigation = useCallback((path) => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: path } } });
      return;
    }

    navigate(path);
    if (window.innerWidth < 992) {
      setIsSidebarOpen(false);
    }
  }, [navigate, currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/ipatroller', icon: <SecurityIcon />, label: 'IPatroller' },
    { path: '/illegals', icon: <WarningIcon />, label: 'Illegals' },
    { path: '/command-center', icon: <VideocamIcon />, label: 'Command Center' },
    { path: '/report', icon: <BarChartIcon />, label: 'Report' },
    { path: '/setup', icon: <SettingsIcon />, label: 'Setup' }
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="layout-container">
      {/* Sidebar Toggle Button */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img 
            src="/src/assets/bataan-logo.png" 
            alt="Bataan Logo" 
            className="sidebar-logo"
            loading="lazy"
          />
          <h1 className="sidebar-title">IPatroller System</h1>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
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
            <ExitToAppIcon className="me-2" />
            Logout
          </Button>
        </div>
      </aside>

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
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout; 