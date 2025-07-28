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
import defaultAvatar from '../assets/react.svg'; // Use your own avatar image if available

function DashboardLayout({ children, activePage }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Restore the handleToggleDarkMode function
  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };
  const handleProfileDropdown = () => setShowProfileDropdown((prev) => !prev);
  const handleProfileBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowProfileDropdown(false);
    }
  };
  const { 
    userRole, 
    userMunicipality, 
    getUserPrivileges, 
    canAccessPage, 
    canAccessFeature,
    getAccessibleNavItems,
    loading: userLoading 
  } = useUserRole();

  const userEmail = "";
  const userAvatar = "";

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
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to logout? You will be redirected to the login page.')) {
      return;
    }
    
    // Show immediate logout feedback
    console.log('Starting immediate logout...');
    
    // Show loading overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-size: 18px;
      font-weight: bold;
    `;
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 20px;">
          <i class="fas fa-sign-out-alt" style="font-size: 48px; color: #fff;"></i>
        </div>
        <div>Logging out...</div>
        <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">Redirecting to login page</div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Clear storage immediately (but keep ipatrollerData for persistence)
    localStorage.removeItem('userRole');
    localStorage.removeItem('userMunicipality');
    localStorage.removeItem('userPrivileges');
    // localStorage.removeItem('ipatrollerData'); // Keep this data for persistence
    sessionStorage.clear();
    
    // Immediately redirect to login page
    window.location.href = '/login';
    
    // Fallback redirect in case the first one doesn't work
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }, 500);
    
    // Continue with cleanup in background (non-blocking)
    try {
      const user = auth.currentUser;
      if (user) {
        // Update user status to offline (non-blocking)
        updateDoc(doc(db, 'users', user.uid), {
          status: 'Inactive',
          lastLogout: new Date()
        }).catch(error => {
          console.error('Error updating user status:', error);
        });
      }
      
      // Sign out from Firebase (non-blocking)
      signOut(auth).catch(error => {
        console.error('Error signing out:', error);
      });
      
    } catch (error) {
      console.error('Error during logout cleanup:', error);
    }
  };

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // Get accessible navigation items
  const accessibleNavItems = getAccessibleNavItems();

  // Show loading spinner while user data is loading
  if (userLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(248,250,252,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
        transition: 'background 0.3s',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" role="status" style={{ width: 60, height: 60, color: '#6366f1', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, color: '#6366f1', fontSize: 20 }}>Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  // Add responsive logic for sidebar
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;

  // Example navItems structure for grouping:
  // [
  //   { section: 'Main', items: [ { key: 'dashboard', label: 'Dashboard', icon: 'fa-home', ... }, ... ] },
  //   { section: 'Reports', items: [ ... ] },
  // ]
  const groupedNavItems = Array.isArray(accessibleNavItems) && accessibleNavItems[0] && accessibleNavItems[0].items ? accessibleNavItems : [{ section: '', items: accessibleNavItems }];

  // User profile/avatar dropdown state
  // const [showProfileDropdown, setShowProfileDropdown] = useState(false); // <-- Moved up
  // const handleProfileDropdown = () => setShowProfileDropdown((prev) => !prev);
  // const handleProfileBlur = (e) => {
  //   if (!e.currentTarget.contains(e.relatedTarget)) {
  //     setShowProfileDropdown(false);
  //   }
  // };

  return (
    <div className={darkMode ? 'dark-mode' : ''} style={{ minHeight: '100vh', width: '100vw', background: darkMode ? 'linear-gradient(135deg, #23272f 0%, #2d3748 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)', fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', padding: 0, margin: 0, overflowX: 'hidden', transition: 'background 0.3s' }}>
      {/* Top Navigation */}
      <div className="shadow-sm bg-white position-fixed" style={{ zIndex: 1100, height: 64, left: sidebarCollapsed ? 64 : 240, right: 0, top: 0, borderBottom: '1px solid #e0e7ef', transition: 'left 0.3s cubic-bezier(.4,0,.2,1)', width: 'auto' }}>
        <div className="d-flex align-items-center justify-content-between h-100 px-4" style={{ width: '100%' }}>
          <div className="d-flex align-items-center gap-3">
            <Button variant="link" className="d-lg-none" onClick={toggleSidebar} style={{ padding: '0.5rem', color: '#4a5568' }}>
              <i className="fas fa-bars fs-5"></i>
            </Button>
            <h4 className="mb-0 fw-bold" style={NAVBAR_TITLE_STYLE}>
              {activePage ? activePage.charAt(0).toUpperCase() + activePage.slice(1) : 'Dashboard'}
            </h4>
            <input type="text" placeholder="Search..." className="form-control ms-3 rounded-3 shadow-sm border-0 bg-light" style={{ width: 200, fontSize: 15 }} />
          </div>
          <div className="d-flex align-items-center gap-3">
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="p-0" style={{ color: '#6366f1', fontSize: 22 }} aria-label="Notifications">
                <i className="fas fa-bell"></i>
                <span className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: 10, height: 10 }}></span>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ minWidth: 260 }}>
                <Dropdown.Header>Notifications</Dropdown.Header>
                <Dropdown.Item>New report submitted</Dropdown.Item>
                <Dropdown.Item>Patroller status updated</Dropdown.Item>
                <Dropdown.Item>System maintenance scheduled</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#">View all notifications</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="p-0" style={{ color: '#6366f1', fontSize: 22 }} aria-label="User menu">
                <img src={userAvatar || defaultAvatar} alt="User Avatar" className="rounded-circle" style={{ width: 30, height: 30 }} />
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ minWidth: 180 }}>
                <Dropdown.Header>{userName || 'User'}</Dropdown.Header>
                <Dropdown.Item onClick={() => setShowProfile(true)}><i className="fas fa-user-circle me-2" /> Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/settings')}><i className="fas fa-cog me-2" /> Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}><i className="fas fa-sign-out-alt me-2" /> Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="link" onClick={handleToggleDarkMode} style={{ color: '#6366f1', fontSize: 22 }} aria-label="Toggle dark mode">
              <i className={`fas ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content wrapper with proper spacing */}
      <div className="d-flex flex-row w-100 min-vh-100" style={{ boxSizing: 'border-box', overflowX: 'hidden', paddingTop: '64px' }}>
        {/* Sidebar */}
        <div className="bg-white shadow-sm position-fixed" style={{ left: 0, top: 0, height: '100vh', width: sidebarCollapsed ? 64 : 240, borderRight: '1.5px solid #e0e7ef', zIndex: 1000, transition: 'width 0.3s cubic-bezier(.4,0,.2,1)' }}>
          <div className="d-flex align-items-center justify-content-between border-bottom px-4" style={{ height: 64 }}>
            <Button variant="link" onClick={toggleSidebar} style={{ color: '#4a5568' }} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`} style={{ fontSize: '1.25rem', transition: 'transform 0.3s', transform: sidebarCollapsed ? 'rotate(180deg)' : 'none' }} />
            </Button>
            <h4 className="mb-0 fw-bold" style={{ ...NAVBAR_TITLE_STYLE, display: sidebarCollapsed ? 'none' : 'block' }}>
              {activePage ? activePage.charAt(0).toUpperCase() + activePage.slice(1) : 'Dashboard'}
            </h4>
          </div>
          <div className="flex-grow-1 overflow-auto px-3 py-4">
            <div className="d-flex flex-column align-items-center mb-4 position-relative" tabIndex={0} onBlur={handleProfileBlur}>
              <button type="button" aria-label="Open profile menu" tabIndex={0} onClick={handleProfileDropdown} className="d-flex align-items-center bg-transparent border-0 p-0 w-100 justify-content-center gap-2">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, color: '#6366f1', fontWeight: 700, fontSize: 20, overflow: 'hidden' }}>
                  {userAvatar ? (
                    <img src={userAvatar} alt="User Avatar" className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                  ) : userName && userName.trim() !== ''
                    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
                    : <img src={defaultAvatar} alt="Default Avatar" className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover' }} />}
                </div>
                {!sidebarCollapsed && (
                  <span className="fw-bold" style={{ fontSize: 16, color: '#22223b', marginLeft: 4, whiteSpace: 'nowrap', letterSpacing: '0.01em', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
                    {userName && userName.trim() !== '' ? userName : 'User'}
                  </span>
                )}
                <i className={`fas fa-chevron-down`} style={{ color: '#6366f1', fontSize: 16, marginLeft: 4, display: sidebarCollapsed ? 'none' : 'inline-block' }} />
              </button>
              {showProfileDropdown && (
                <div className="position-absolute" style={{ top: 48, left: sidebarCollapsed ? '50%' : 0, transform: sidebarCollapsed ? 'translateX(-50%)' : 'none', minWidth: 140, background: '#fff', border: '1px solid #e0e7ef', boxShadow: '0 4px 16px rgba(76, 81, 255, 0.10)', borderRadius: 8, zIndex: 2000, padding: '0.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }} tabIndex={-1}>
                  <button type="button" className="bg-transparent border-0 text-start px-4 py-2 fw-bold" style={{ color: '#22223b', fontSize: 15 }} onClick={() => navigate('/profile')}>
                    <i className="fas fa-user-circle me-2" /> Profile
                  </button>
                  <button type="button" className="bg-transparent border-0 text-start px-4 py-2 fw-bold" style={{ color: '#22223b', fontSize: 15 }} onClick={() => navigate('/settings')}>
                    <i className="fas fa-cog me-2" /> Settings
                  </button>
                  <button type="button" className="bg-transparent border-0 text-start px-4 py-2 fw-bold" style={{ color: '#dc3545', fontSize: 15 }} onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2" /> Logout
                  </button>
                </div>
              )}
            </div>
            {/* Section grouping and nav items */}
            {groupedNavItems.map((group, groupIdx) => (
              <React.Fragment key={group.section || groupIdx}>
                {!sidebarCollapsed && group.section && (
                  <div className="fw-bold text-uppercase text-secondary mb-2 ps-2" style={{ fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                    {group.section}
                  </div>
                )}
                {group.items.map((item, idx) => (
                  <li key={item.key} className="list-unstyled mb-2 w-100 position-relative">
                    <Button
                      variant="link"
                      className={`nav-link w-100 text-start px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-3${activePage === item.key ? ' active' : ''}`}
                      onClick={() => { if (item.to) { navigate(item.to); } }}
                      style={{ color: activePage === item.key ? '#6366f1' : '#4a5568', background: activePage === item.key ? 'rgba(99,102,241,0.08)' : 'transparent', fontSize: '0.95em', letterSpacing: '0.5px', position: 'relative' }}
                      {...(sidebarCollapsed ? { title: item.label } : {})}
                    >
                      <i className={`fas ${item.icon}`} style={{ fontSize: '1rem' }}></i>
                      {!sidebarCollapsed && item.label}
                      {/* Notification Badge */}
                      {item.badge && (
                        <span className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ minWidth: 18, height: 18, fontSize: 12, fontWeight: 700, padding: typeof item.badge === 'number' ? '0 6px' : 0, zIndex: 10, boxShadow: '0 2px 6px rgba(220,53,69,0.15)' }}>
                          {typeof item.badge === 'number' ? item.badge : ''}
                        </span>
                      )}
                    </Button>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main content area with proper margin */}
        <div style={{ 
          marginLeft: sidebarCollapsed ? '64px' : '240px',
          marginTop: '0',
          width: '100%',
          padding: '1.5rem',
          transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)',
          position: 'relative'
        }}>
          {children}
        </div>
      </div>
      {/* Mobile Sidebar Backdrop */}
      {isMobileView && !sidebarCollapsed && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.2)', zIndex: 1999 }} onClick={toggleSidebar} />
      )}
      {/* Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} size="lg" centered dialogClassName="rounded-4">
        <Modal.Header closeButton className="rounded-top-4 border-bottom">
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="rounded-bottom-4">
          <Profile />
        </Modal.Body>
      </Modal>
      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

export default DashboardLayout; 