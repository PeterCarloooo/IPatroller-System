import React from 'react';
import { Button, Dropdown, Badge } from 'react-bootstrap';
import { useUserRole } from '../context/UserContext';

function TopNavbar({ 
  userName, 
  userRole, 
  userMunicipality, 
  userPrivileges = [], 
  onShowProfile, 
  onLogout, 
  onToggleSidebar,
  canAccessFeature 
}) {
  
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
  
  // User avatar/initials
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  // Determine display name and initials
  const displayName = userRole === 'Administrator'
    ? 'Administrator'
    : userName
      ? userName
      : 'Loading...';
  const initials = userRole === 'Administrator'
    ? 'AD'
    : getInitials(userName || 'U');

  return (
    <nav className="shadow-sm border-bottom top-navbar-blur" style={{ 
      padding: '1rem 1.5rem',
      minHeight: 70,
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1020,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div className="d-flex align-items-center justify-content-between w-100">
        <div className="d-flex align-items-center gap-3">
          {/* Toggle Sidebar Button */}
          <Button
            variant="light"
            size="sm"
            className="border-0 shadow-sm sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </Button>
        </div>

        {/* User Account Section */}
        <div className="d-flex align-items-center gap-2">
          {/* Notifications (if user has access) */}
          {canAccessFeature && typeof canAccessFeature === 'function' && canAccessFeature('view-notifications') && (
            <Button
              variant="light"
              size="sm"
              className="border-0 shadow-sm position-relative"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                border: '1px solid rgba(227, 233, 247, 0.8)',
                borderRadius: '12px',
                padding: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)'
              }}
            >
              <i className="fas fa-bell text-muted"></i>
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: '0.6rem' }}
              >
                3
              </Badge>
            </Button>
          )}

          {/* User Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle 
              as={Button} 
              variant="light" 
              className="border-0 shadow-sm d-flex align-items-center gap-2 profile-dropdown-toggle"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                border: '1px solid rgba(227, 233, 247, 0.8)',
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0,0,0,0.1)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.05)';
              }}
            >
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold profile-avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                  boxShadow: '0 2px 6px 0 rgba(13,110,253,0.2)'
                }}
              >
                {initials}
              </div>
              <span className="fw-semibold d-none d-md-inline" style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
                {displayName}
              </span>
              <i className="fas fa-chevron-down" style={{ fontSize: '0.8rem', color: '#6c757d' }}></i>
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ 
              minWidth: 280, 
              borderRadius: '12px', 
              border: '1px solid rgba(227, 233, 247, 0.8)', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              padding: '0.5rem',
              background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)'
            }}>
              <Dropdown.Header className="fw-bold" style={{ 
                color: '#2c3e50', 
                fontSize: '0.9rem',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(227, 233, 247, 0.5)'
              }}>
                <i className="fas fa-user-circle me-2 text-primary"></i>
                Account Information
              </Dropdown.Header>
              
              {/* User Details */}
              <div className="px-3 py-2">
                <div className="d-flex align-items-center mb-2">
                  <Badge bg={userRole === 'Administrator' ? 'primary' : 'secondary'} className="me-2">
                    {userRole}
                  </Badge>
                  {userMunicipality && (
                    <Badge bg="info">
                      {userMunicipality}
                    </Badge>
                  )}
                </div>
                {userPrivileges.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted d-block mb-1">Privileges:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {userPrivileges.map((privilege, idx) => (
                        <Badge key={idx} bg="light" text="dark" className="small">
                          {privilege}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Dropdown.Divider style={{ margin: '0.5rem 0', borderColor: 'rgba(227, 233, 247, 0.5)' }} />
              
              <Dropdown.Item 
                onClick={onShowProfile} 
                style={{ 
                  borderRadius: '8px', 
                  margin: '0.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: '0.75rem 1rem',
                  fontWeight: 500
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(13,110,253,0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <i className="fas fa-user me-2 text-primary"></i>
                View Profile
              </Dropdown.Item>

              <Dropdown.Divider style={{ margin: '0.5rem 0', borderColor: 'rgba(227, 233, 247, 0.5)' }} />
              
              <Dropdown.Item 
                onClick={onLogout}
                className="text-danger" 
                style={{ 
                  borderRadius: '8px', 
                  margin: '0.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: '0.75rem 1rem',
                  fontWeight: 500
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(220,53,69,0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}

export default TopNavbar; 