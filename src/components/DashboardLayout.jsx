// Sidebar navigation configuration (no hooks or userRole here)
const SIDEBAR_NAV_ITEMS = [
  { key: 'dashboard', icon: 'fa-home', label: 'Dashboard', to: 'DYNAMIC_DASHBOARD' },
  { key: 'ipatroller-status', icon: 'fa-shield-alt', label: 'IPatroller Status', to: '/ipatroller-status' },
  { key: 'command-center', icon: 'fa-broadcast-tower', label: 'Command Center', to: '/command-center' },
  { key: 'incidents-reports', icon: 'fa-file-alt', label: 'Incidents Reports', to: '/incidents-reports' },
  { key: 'reports', icon: 'fa-chart-line', label: 'Reports', to: '/reports' },
  { key: 'users', icon: 'fa-users', label: 'Users', to: '/users' },
  { key: 'setups', icon: 'fa-cogs', label: 'Setups', to: '/setups' },
  { key: 'settings', icon: 'fa-cog', label: 'Settings', to: '/settings' },
];
const SIDEBAR_HEADER_STYLE = { width: '54px', height: '54px', background: '#f5f7fa', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' };
const LOGOUT_BTN_STYLE = { fontSize: '1.08em', transition: 'background 0.2s', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.04)' };
const BADGE_STYLE = { fontSize: '0.95em', fontWeight: 600, letterSpacing: '0.5px', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.04)' };
const NAVBAR_TITLE_STYLE = { letterSpacing: '1px', fontFamily: 'inherit' };

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import Profile from '../pages/Profile';
import { useUserRole } from '../context/UserContext';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Nav, Button, Modal, Stack, Badge, Spinner, Offcanvas } from 'react-bootstrap';

// Sidebar component
function Sidebar({ activePage, userRole, isMobile, onNavigate, onLogout }) {
  return (
    <>
      {/* Sidebar Header */}
      <Stack direction="horizontal" gap={2} className="p-3 border-bottom bg-light align-items-center" style={{ borderTopRightRadius: isMobile ? 0 : '1.25rem', minHeight: 72, background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
        <div style={{ ...SIDEBAR_HEADER_STYLE, background: '#fff', border: '2px solid #e3e9f7', width: 40, height: 40 }} className="rounded-circle d-flex align-items-center justify-content-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
            alt="Bataan Seal"
            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
          />
        </div>
        {!isMobile && <span className="fs-5 fw-bold text-dark ms-2" style={{ ...NAVBAR_TITLE_STYLE, fontWeight: 700, letterSpacing: '2px' }}>IPatroller</span>}
      </Stack>
      {/* Sidebar Navigation */}
      <Nav className="flex-grow-1 flex-column gap-2 mt-3" variant="pills" aria-label="Sidebar navigation" style={{ padding: '0 0.25rem' }}>
        {SIDEBAR_NAV_ITEMS.map(item => {
          const resolvedTo = item.to === 'DYNAMIC_DASHBOARD'
            ? (userRole === 'User' ? '/user-dashboard' : '/dashboard')
            : item.to;
          const isActive = activePage === item.key;
          return (
            <Nav.Item key={item.key} className="w-100">
              <Nav.Link
                active={isActive}
                onClick={() => onNavigate(resolvedTo)}
                className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 sidebar-link ${isActive ? 'active' : ''}`}
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                style={{ fontSize: '1.05rem', fontWeight: 500, transition: 'background 0.2s, color 0.2s', marginBottom: 2, background: isActive ? 'rgba(13,110,253,0.10)' : 'transparent', color: isActive ? '#0d6efd' : '#222' }}
                onFocus={e => e.target.classList.add('sidebar-link-focus')}
                onBlur={e => e.target.classList.remove('sidebar-link-focus')}
              >
                <i className={`fas ${item.icon} me-2`} style={{ fontSize: '1.15em', minWidth: 22, textAlign: 'center' }}></i> <span>{item.label}</span>
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
      {/* Sidebar Footer */}
      <div className="p-3 border-top bg-light mt-auto" style={{ borderBottomRightRadius: isMobile ? 0 : '1.25rem', background: '#f8fafc' }}>
        <Button variant="primary" className="d-flex align-items-center gap-2 w-100 justify-content-center fw-semibold" style={{ ...LOGOUT_BTN_STYLE, padding: '0.5rem 0' }} onClick={onLogout} aria-label="Logout">
          <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
        </Button>
      </div>
    </>
  );
}

// Top Navbar component
function TopNavbar({ activePage, userName, userRole, onProfile }) {
  // Dynamic page titles
  const pageTitles = {
    dashboard: 'Dashboard',
    'ipatroller-status': 'IPatroller Status',
    'command-center': 'Command Center',
    'incidents-reports': 'Incidents Reports',
    reports: 'Reports',
    users: 'Users',
    setups: 'Setups',
    settings: 'Settings',
    'user-dashboard': 'User Dashboard',
  };
  const title = pageTitles[activePage] || 'Dashboard';
  // User avatar/initials
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
  };
  return (
    <nav className='top-navbar shadow-sm border-bottom border-2 border-light' style={{ borderRadius: '1rem', background: '#fff', marginBottom: '1.2rem', padding: '0.75rem 1.5rem', minHeight: 56, display: 'flex', alignItems: 'center' }}>
      <div className="container-fluid px-0">
        <div className="d-flex align-items-center justify-content-between w-100">
          <h4 className="fw-bold fs-5 mb-0 d-flex align-items-center gap-2" style={NAVBAR_TITLE_STYLE}>
            <i className={
              activePage === 'dashboard' || activePage === 'user-dashboard' ? 'fas fa-gauge-high text-primary' :
              activePage === 'ipatroller-status' ? 'fas fa-shield-halved text-info' :
              activePage === 'command-center' ? 'fas fa-broadcast-tower text-warning' :
              activePage === 'incidents-reports' ? 'fas fa-file-alt text-danger' :
              activePage === 'reports' ? 'fas fa-chart-line text-success' :
              activePage === 'users' ? 'fas fa-users text-primary' :
              activePage === 'setups' ? 'fas fa-cogs text-secondary' :
              activePage === 'settings' ? 'fas fa-gear text-dark' :
              'fas fa-circle-info text-secondary'
            } style={{ fontSize: '1.1em' }}></i>
            {title}
          </h4>
          {/* User Account Section */}
          <div className="d-flex align-items-center">
            <div className="text-end me-2">
              <div className="text-muted d-flex align-items-center gap-2">
                {userName !== 'Administrator' && userName}
                {userRole === 'Administrator' && (
                  <Badge bg="primary" className="ms-2" style={BADGE_STYLE}>Admin</Badge>
                )}
              </div>
            </div>
            <Button
              variant="light"
              className="rounded-circle bg-primary bg-opacity-10 p-2 text-decoration-none border-0 shadow-sm d-flex align-items-center justify-content-center"
              title="Profile"
              style={{ cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.04)', width: 32, height: 32 }}
              onClick={onProfile}
              aria-label="Open profile modal"
            >
              {userRole !== 'Administrator' ? (
                <span className="fw-bold text-primary" style={{ fontSize: '0.95em' }}>{getInitials(userName)}</span>
              ) : (
                <i className="fas fa-user text-primary"></i>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Main DashboardLayout
function DashboardLayout({ children, activePage }) {
  const navigate = useNavigate();
  const { userRole } = useUserRole();
  const [userName, setUserName] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  // Fetch user name and handle responsive layout
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      if (user.email === 'admin@admin.com') {
        setUserName('Administrator');
      } else {
        getDoc(doc(db, 'users', user.uid)).then(userDoc => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.firstName || user.email);
          } else {
            setUserName(user.email);
          }
        });
      }
    }
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (userRole === null) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255,255,255,0.95)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Spinner animation="border" variant="primary" style={{ width: 60, height: 60 }} />
      </div>
    );
  }

  // Navigation handlers
  const handleNavigate = (to) => {
    navigate(to);
    setShowSidebar(false);
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)' }}>
      {/* Sidebar for desktop, Offcanvas for mobile */}
      {isMobile ? (
        <>
          <Button variant="outline-primary" className="m-2 d-md-none position-fixed" style={{ zIndex: 2001, left: 10, top: 10 }} onClick={() => setShowSidebar(true)} aria-label="Open sidebar">
            <i className="fas fa-bars"></i>
          </Button>
          <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="start" style={{ width: 180 }}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0 d-flex flex-column" style={{ height: '100%' }}>
              <Sidebar activePage={activePage} userRole={userRole} isMobile={isMobile} onNavigate={handleNavigate} onLogout={handleLogout} />
            </Offcanvas.Body>
          </Offcanvas>
        </>
      ) : (
        <aside className="sidebar shadow-lg d-flex flex-column align-items-stretch"
          style={{
            width: 180,
            background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
            borderRight: '2px solid #e3e9f7',
            zIndex: 1050,
            borderRadius: '0 1.25rem 1.25rem 0',
            boxShadow: '8px 0 32px 0 rgba(0,0,0,0.08)',
            minHeight: '100vh',
            position: 'sticky',
            top: 0,
            transition: 'all 0.2s',
            display: 'flex',
          }}>
          <Sidebar activePage={activePage} userRole={userRole} isMobile={isMobile} onNavigate={handleNavigate} onLogout={handleLogout} />
        </aside>
      )}
      {/* Divider between sidebar and content */}
      <div style={{ width: 2, background: 'linear-gradient(180deg, #e3e9f7 0%, #f8fafc 100%)', minHeight: '100vh', boxShadow: '0 0 8px 0 rgba(0,0,0,0.03)' }} />
      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column align-items-stretch" style={{ background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)', minHeight: '100vh', padding: isMobile ? '0.5rem 0.25rem' : '1.5rem 1rem 1rem 1rem', transition: 'padding 0.2s' }}>
        {/* Top Navbar */}
        <TopNavbar activePage={activePage} userName={userName} userRole={userRole} onProfile={() => setShowProfileModal(true)} />
        {/* Content Area */}
        <div className="content-wrapper flex-grow-1 d-flex flex-column align-items-stretch" style={{ background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.06)', padding: isMobile ? '0.5rem' : '1.2rem', minHeight: 0, flex: 1, overflow: 'auto', transition: 'padding 0.2s' }}>
          {children}
        </div>
        {/* Profile Modal */}
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered size="lg" contentClassName="border-0 shadow-lg rounded-4" backdropClassName="modal-backdrop">
          <Modal.Header closeButton className="border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
            <Modal.Title className="fw-bold">Profile Information</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1.1rem' }}>
            <div className="container-fluid px-0">
              <Profile section="profile" />
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default DashboardLayout; 