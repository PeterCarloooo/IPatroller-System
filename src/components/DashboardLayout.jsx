import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import Profile from '../pages/Profile';
import { useUserRole } from '../context/UserContext';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

function DashboardLayout({ children, activePage }) {
  // All hooks at the top
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { userRole } = useUserRole();
  const [userName, setUserName] = useState('');

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
  }, []);

  // Only after all hooks: show loading spinner if userRole is not loaded
  if (userRole === null) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.95)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="spinner-border text-primary" style={{ width: 60, height: 60 }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'} shadow-lg`} style={{ zIndex: 1050, background: '#fff', boxShadow: '2px 0 15px rgba(0,0,0,0.08)' }}>
        <div className="d-flex flex-column h-100" style={{ overflowY: 'auto', minHeight: 0, flex: 1 }}>
          {/* Sidebar Header */}
          <div className="p-4 border-bottom bg-light">
            <div className={`d-flex ${!isSidebarOpen ? 'justify-content-center' : ''} align-items-center`}>
              <div style={{ width: '48px', height: '48px', flexShrink: 0 }} className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
                  alt="Bataan Seal"
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                />
              </div>
              {isSidebarOpen && (
                <span className="fs-4 fw-bold text-dark ms-3">IPatroller</span>
              )}
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="p-3 flex-grow-1 sidebar-menu">
            <ul className="nav flex-column gap-2">
              <li className="nav-item">
                <a 
                  href="#"
                  onClick={() => navigate(userRole === 'User' ? '/user-dashboard' : '/dashboard')}
                  className={`nav-link text-dark d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${activePage === 'dashboard' ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                  style={{ cursor: 'pointer', fontWeight: 500, fontSize: '1.08em' }}
                >
                  <i className={`fas fa-home`}></i>
                  {isSidebarOpen && <span>Dashboard</span>}
                </a>
              </li>
              {userRole === 'Administrator' && (
                <>
                  <li className="nav-item">
                    <a 
                      href="#"
                      onClick={() => navigate('/ipatroller-status')}
                      className={`nav-link text-dark d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${activePage === 'ipatroller-status' ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                      style={{ cursor: 'pointer', fontWeight: 500, fontSize: '1.08em' }}
                    >
                      <i className={`fas fa-shield-alt`}></i>
                      {isSidebarOpen && <span>IPatroller Status</span>}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a 
                      href="#"
                      onClick={() => navigate('/command-center')}
                      className={`nav-link text-dark d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${activePage === 'command-center' ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                      style={{ cursor: 'pointer', fontWeight: 500, fontSize: '1.08em' }}
                    >
                      <i className={`fas fa-broadcast-tower`}></i>
                      {isSidebarOpen && <span>Command Center</span>}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a 
                      href="#"
                      onClick={() => navigate('/incidents-reports')}
                      className={`nav-link text-dark d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${activePage === 'incidents-reports' ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                      style={{ cursor: 'pointer', fontWeight: 500, fontSize: '1.08em' }}
                    >
                      <i className={`fas fa-file-alt`}></i>
                      {isSidebarOpen && <span>Incidents Reports</span>}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a 
                      href="#"
                      onClick={() => navigate('/reports')}
                      className={`nav-link text-dark d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${activePage === 'reports' ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                      style={{ cursor: 'pointer', fontWeight: 500, fontSize: '1.08em' }}
                    >
                      <i className={`fas fa-chart-line`}></i>
                      {isSidebarOpen && <span>Reports</span>}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a 
                      href="#"
                      onClick={() => navigate('/users')}
                      className={`nav-link text-dark d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${activePage === 'users' ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                      style={{ cursor: 'pointer', fontWeight: 500, fontSize: '1.08em' }}
                    >
                      <i className={`fas fa-users`}></i>
                      {isSidebarOpen && <span>Users</span>}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a 
                      href="#"
                      onClick={() => navigate('/setups')}
                      className={`nav-link text-dark d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${activePage === 'setups' ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                      style={{ cursor: 'pointer', fontWeight: 500, fontSize: '1.08em' }}
                    >
                      <i className={`fas fa-cogs`}></i>
                      {isSidebarOpen && <span>Setups</span>}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a 
                      href="#"
                      onClick={e => { e.preventDefault(); navigate('/settings'); }}
                      className={`nav-link text-dark d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${activePage === 'settings' ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                      style={{ cursor: 'pointer', fontWeight: 500, fontSize: '1.08em' }}
                    >
                      <i className={`fas fa-cog`}></i>
                      {isSidebarOpen && <span>Settings</span>}
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-top bg-light mt-auto">
            <button 
              className={`btn btn-primary d-flex align-items-center gap-2 ${!isSidebarOpen ? 'justify-content-center w-auto px-3' : 'w-100 justify-content-center'}`}
              style={{ fontWeight: 600, fontSize: '1.08em', letterSpacing: '0.5px' }}
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarOpen ? 'content-expanded' : 'content-collapsed'}`} style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {/* Top Navbar */}
        <nav className='top-navbar shadow-sm border-bottom border-2 border-light'>
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center">
                <button 
                  className='text-dark p-0 me-3'
                  style={{ fontSize: '1.5rem' }}
                  onClick={toggleSidebar}
                >
                  <i className={`fas ${isSidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
                </button>
                <h4 className="fw-bold fs-4">
                  {activePage === 'settings' ? 'Settings' : 'Dashboard'}
                </h4>
              </div>

              {/* User Account Section */}
              <div className="d-flex align-items-center">
                <div className="text-end me-3">
                  <div className="text-muted d-flex align-items-center gap-2">
                    {/* Hide the literal word 'Administrator', only show userName if not 'Administrator' */}
                    {userName !== 'Administrator' && userName}
                    {userRole === 'Administrator' && (
                      <span className="badge bg-primary ms-2" style={{ fontSize: '0.95em', fontWeight: 600, letterSpacing: '0.5px' }}>Admin</span>
                    )}
                  </div>
                </div>
                <button
                  className="rounded-circle bg-primary bg-opacity-10 p-2 text-decoration-none border-0 shadow-sm"
                  title="Profile"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowProfileModal(true)}
                >
                  <i className="fas fa-user text-primary"></i>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="content-wrapper p-3 p-md-4">
          {children}
        </div>
        {/* Profile Modal */}
        {showProfileModal && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-4" style={{ background: '#fff' }}>
                <div className="modal-header border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                  <h5 className="modal-title fw-bold">Profile Information</h5>
                  <button type="button" className="btn-close" onClick={() => setShowProfileModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1.5rem' }}>
                  <div className="container-fluid px-0">
                    <Profile section="profile" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardLayout; 