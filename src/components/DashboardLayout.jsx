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
import { updateDoc, doc } from 'firebase/firestore';
import Profile from '../pages/Profile';
import { useUserRole } from '../context/UserContext';
import { db } from '../firebase/config';
import { getDoc } from 'firebase/firestore';
import { Button, Modal, Badge, Spinner, Offcanvas, Dropdown, Container, Card } from 'react-bootstrap';
import Sidebar from './Sidebar';

// Top Navbar component
function TopNavbar({ activePage, userName, userRole, onProfile, sidebarCollapsed, setSidebarCollapsed, isMobile }) {
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
  // Mock notifications
  const notifications = [
    { id: 1, text: 'New incident reported', read: false },
    { id: 2, text: 'User John updated profile', read: true },
    { id: 3, text: 'System maintenance scheduled', read: false },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <nav className='top-navbar shadow-sm border-bottom border-2 border-light' style={{ borderRadius: '1.25rem', background: 'rgba(255,255,255,0.92)', marginBottom: '1.2rem', padding: '0.7rem 1.5rem', minHeight: 54, display: 'flex', alignItems: 'center', backdropFilter: 'blur(6px)', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 1020 }}>
      <div className="container-fluid px-0">
        <div className="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            {/* Collapse/Expand Sidebar Button (desktop only) */}
            {!isMobile && (
              <Button
                variant="light"
                size="sm"
                className="border-0 shadow-none px-2"
                style={{ fontSize: '1.3em', color: '#0d6efd', background: 'transparent' }}
                onClick={() => setSidebarCollapsed(c => !c)}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <i className={`fas fa-angle-${sidebarCollapsed ? 'right' : 'left'}`}></i>
              </Button>
            )}
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
              } style={{ fontSize: '1.15em', filter: 'drop-shadow(0 1px 2px #0d6efd22)' }}></i>
              {title}
            </h4>
          </div>
          {/* User Account Section */}
          <div className="d-flex align-items-center gap-2">
            {/* Notifications Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle as={Button} variant="light" className="position-relative rounded-circle p-2 border-0 shadow-sm d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }} aria-label="Notifications">
                <i className="bi bi-bell-fill text-info" style={{ fontSize: '1.2em' }}></i>
                {unreadCount > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-0 end-0 translate-middle" style={{ fontSize: '0.7em', minWidth: 18, minHeight: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ minWidth: 260 }}>
                <Dropdown.Header>Notifications</Dropdown.Header>
                {notifications.length === 0 && <Dropdown.ItemText className="text-muted">No notifications</Dropdown.ItemText>}
                {notifications.map(n => (
                  <Dropdown.Item key={n.id} className={n.read ? '' : 'fw-bold'}>
                    {n.text}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle as={Button} variant="light" className="rounded-circle bg-primary bg-opacity-10 p-2 text-decoration-none border-0 shadow-sm d-flex align-items-center justify-content-center" title="Profile" style={{ cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.04)', width: 36, height: 36, border: '2px solid #e3e9f7' }} aria-label="Open profile menu">
                {userRole !== 'Administrator' ? (
                  <span className="fw-bold text-primary" style={{ fontSize: '1.05em' }}>{getInitials(userName)}</span>
                ) : (
                  <i className="fas fa-user text-primary"></i>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Header>{userName}</Dropdown.Header>
                <Dropdown.Item onClick={onProfile}><i className="fas fa-user-circle me-2"></i> Profile</Dropdown.Item>
                <Dropdown.Item><i className="fas fa-cog me-2"></i> Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => window.location.href = '/login'} className="text-danger"><i className="fas fa-sign-out-alt me-2"></i> Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    console.log('Logout clicked');
    try {
      const user = auth.currentUser;
      if (user && userRole === 'User') {
        await updateDoc(doc(db, 'users', user.uid), { status: 'Logout' });
        console.log('Status set to Logout');
      }
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
          <Button variant="outline-primary" className="m-2 d-md-none position-fixed" style={{ zIndex: 2001, left: 10, top: 10, borderRadius: '0.75rem', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.08)' }} onClick={() => setShowSidebar(true)} aria-label="Open sidebar">
            <i className="fas fa-bars"></i>
          </Button>
          <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="start" style={{ width: 190, borderRadius: '0 1.5rem 1.5rem 0', background: 'rgba(255,255,255,0.95)' }}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0 d-flex flex-column" style={{ height: '100%' }}>
              <Sidebar activePage={activePage} userRole={userRole} isMobile={isMobile} onNavigate={handleNavigate} onLogout={handleLogout} />
            </Offcanvas.Body>
          </Offcanvas>
        </>
      ) : (
        <aside
          className="sidebar shadow-lg d-flex flex-column align-items-stretch sidebar-glass"
          style={{
            width: sidebarCollapsed ? 60 : 190,
            minWidth: sidebarCollapsed ? 60 : 190,
            maxWidth: sidebarCollapsed ? 60 : 190,
            background: 'rgba(255,255,255,0.92)',
            borderRight: '2px solid #e3e9f7',
            zIndex: 1050,
            borderRadius: '0 1.5rem 1.5rem 0',
            boxShadow: '8px 0 32px 0 rgba(0,0,0,0.08)',
            minHeight: '100vh',
            position: 'sticky',
            top: 0,
            transition: 'all 0.2s',
            display: 'flex',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Sidebar
            activePage={activePage}
            userRole={userRole}
            isMobile={isMobile}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </aside>
      )}
      {/* Divider between sidebar and content */}
      <div style={{ width: 2, background: 'linear-gradient(180deg, #e3e9f7 0%, #f8fafc 100%)', minHeight: '100vh', boxShadow: '0 0 8px 0 rgba(0,0,0,0.03)' }} />
      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column align-items-stretch"
        style={{
          background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
          minHeight: '100vh',
          padding: 0,
          transition: 'padding 0.2s',
        }}
      >
        <Container fluid className={isMobile ? 'py-2 px-1' : 'py-4 px-3'} style={{ flex: 1, minWidth: 0 }}>
          <Card className="shadow border-0 rounded-4 bg-white bg-opacity-75 mb-3" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="p-0">
              {/* Top Navbar */}
              <TopNavbar
                activePage={activePage}
                userName={userName}
                userRole={userRole}
                onProfile={() => setShowProfileModal(true)}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                isMobile={isMobile}
              />
              {/* Content Area */}
              <div className="content-wrapper flex-grow-1 d-flex flex-column align-items-stretch content-glass" style={{ background: 'rgba(255,255,255,0.97)', borderRadius: '1.25rem', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', padding: isMobile ? '0.5rem' : '1.3rem', minHeight: 0, flex: 1, overflow: 'auto', transition: 'padding 0.2s', backdropFilter: 'blur(4px)' }}>
                {children}
              </div>
            </div>
          </Card>
        </Container>
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