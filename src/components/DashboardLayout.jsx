// Sidebar navigation configuration (no hooks or userRole here)
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
import TopNavbar from './TopNavbar';

function DashboardLayout({ children, activePage }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState('');
  const { 
    userRole, 
    userMunicipality, 
    getUserPrivileges, 
    canAccessPage, 
    canAccessFeature,
    getAccessibleNavItems,
    loading: userLoading 
  } = useUserRole();

  // Get user name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(`${userData.firstName} ${userData.lastName}`);
          } else {
            setUserName(user.email || '');
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
          setUserName(user.email || '');
        }
      }
    };

    fetchUserName();
  }, []);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if current page is accessible
  useEffect(() => {
    if (!userLoading && activePage && !canAccessPage(activePage)) {
      // Redirect to dashboard if user doesn't have access to current page
      navigate('/dashboard');
    }
  }, [userLoading, activePage, canAccessPage, navigate]);

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Update user status to offline
        await updateDoc(doc(db, 'users', user.uid), {
          status: 'Inactive',
          lastLogout: new Date()
        });
      }
      
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      await signOut(auth);
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // Get accessible navigation items
  const accessibleNavItems = getAccessibleNavItems();

  // Show loading spinner while user data is loading
  if (userLoading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        activePage={activePage}
        navItems={accessibleNavItems}
        userRole={userRole}
        userMunicipality={userMunicipality}
        userPrivileges={getUserPrivileges()}
      />

      {/* Mobile Sidebar */}
      <Offcanvas show={showMobileSidebar} onHide={toggleMobileSidebar} placement="start" className="mobile-sidebar">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Sidebar 
            collapsed={false}
            onToggle={toggleMobileSidebar}
            activePage={activePage}
            navItems={accessibleNavItems}
            userRole={userRole}
            userMunicipality={userMunicipality}
            userPrivileges={getUserPrivileges()}
            isMobile={true}
          />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Navigation */}
        <TopNavbar 
          onToggleSidebar={isMobile ? toggleMobileSidebar : toggleSidebar}
          userName={userName}
          userRole={userRole}
          userMunicipality={userMunicipality}
          userPrivileges={getUserPrivileges()}
          onShowProfile={() => setShowProfile(true)}
          onLogout={handleLogout}
          canAccessFeature={canAccessFeature}
        />

        {/* Page Content */}
        <main className="content-area">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Profile />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default DashboardLayout; 