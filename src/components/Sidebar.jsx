import React from 'react';
import { Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SIDEBAR_HEADER_STYLE = { 
  width: '54px', 
  height: '54px', 
  background: '#fff', 
  border: '2px solid #e3e9f7', 
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' 
};

const NAVBAR_TITLE_STYLE = { 
  letterSpacing: '2px', 
  fontWeight: 700, 
  fontFamily: 'inherit' 
};

const LOGOUT_BTN_STYLE = { 
  fontSize: '1.08em', 
  transition: 'all 0.3s ease', 
  boxShadow: '0 4px 12px 0 rgba(13,110,253,0.15)', 
  padding: '0.75rem 0',
  border: 'none',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
};

const NAV_ITEM_STYLE = {
  fontSize: '0.9rem',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  marginBottom: 4,
  minWidth: 36,
  background: 'transparent',
  border: 'none',
  borderRadius: '10px',
  position: 'relative',
  overflow: 'hidden'
};

const ACTIVE_NAV_STYLE = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.3)',
  transform: 'translateX(6px)'
};

const HOVER_NAV_STYLE = {
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
  transform: 'translateX(3px)',
  boxShadow: '0 4px 12px 0 rgba(102, 126, 234, 0.15)'
};

function Sidebar({ 
  activePage, 
  userRole, 
  userMunicipality, 
  userPrivileges = [], 
  navItems = [], 
  isMobile = false, 
  onLogout, 
  collapsed = false, 
  onToggle 
}) {
  const navigate = useNavigate();

  const handleNavigate = (to) => {
    navigate(to);
    if (isMobile && onToggle) {
      onToggle();
    }
  };

  const getResolvedPath = (item) => {
    if (item.to === 'DYNAMIC_DASHBOARD') {
      return userRole === 'User' ? '/user-dashboard' : '/dashboard';
    }
    return item.to;
  };

  return (
    <div
      className="sidebar-collapsible d-flex flex-column"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 1050,
        width: collapsed ? 60 : 220,
        minWidth: collapsed ? 60 : 220,
        maxWidth: collapsed ? 60 : 220,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.15)',
        transition: 'width 0.25s cubic-bezier(.4,2,.6,1), min-width 0.25s cubic-bezier(.4,2,.6,1), max-width 0.25s cubic-bezier(.4,2,.6,1)',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header Section */}
      <div className="d-flex flex-column align-items-center w-100" style={{ 
        padding: collapsed ? '1.2rem 0.5rem 0.5rem 0.5rem' : '1.7rem 1.2rem 0.5rem 1.2rem', 
        transition: 'padding 0.3s ease',
        flexShrink: 0
      }}>
        <div style={{ 
          ...SIDEBAR_HEADER_STYLE, 
          width: 60, 
          height: 60, 
          border: '3px solid rgba(255, 255, 255, 0.2)', 
          background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', 
          boxShadow: '0 8px 25px 0 rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }} 
        className="rounded-circle d-flex align-items-center justify-content-center mb-3"
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)';
          e.currentTarget.style.boxShadow = '0 12px 35px 0 rgba(0,0,0,0.3)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(0,0,0,0.2)';
        }}
        role="button"
        tabIndex={0}
        onClick={() => handleNavigate('/dashboard')}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
            alt="Bataan Seal"
            style={{ 
              width: 50, 
              height: 50, 
              objectFit: 'contain', 
              borderRadius: '50%',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>
        {!isMobile && !collapsed && (
          <>
            <span className="fs-5 fw-bold" style={{ 
              ...NAVBAR_TITLE_STYLE, 
              fontWeight: 700, 
              letterSpacing: '2px', 
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#fff',
              fontSize: '1.4rem'
            }}>IPatroller</span>
            <span style={{ 
              fontSize: '0.9em', 
              fontWeight: 500, 
              letterSpacing: '0.5px', 
              marginTop: '-2px',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>Province of Bataan</span>
          </>
        )}
      </div>

      {/* Divider */}
      <div style={{ 
        height: 2, 
        width: '80%', 
        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)', 
        margin: '0.5rem auto', 
        opacity: 0.8,
        borderRadius: '1px',
        flexShrink: 0
      }} />

      {/* User Info Section */}
      {/*!collapsed && !isMobile && (
        <div className="px-3 mb-3" style={{ flexShrink: 0 }}>
          <div className="user-info-section">
            <div className="d-flex align-items-center mb-2">
              <Badge bg={userRole === 'Administrator' ? 'primary' : 'secondary'} className="me-2">
                {userRole}
              </Badge>
              <small className="text-white-50">{userMunicipality || 'No Municipality'}</small>
            </div>
            {userPrivileges.length > 0 && (
              <div>
                <small className="text-white-50 d-block mb-1">Privileges:</small>
                <div className="d-flex flex-wrap gap-1">
                  {userPrivileges.slice(0, 2).map((privilege, idx) => (
                    <Badge key={idx} bg="light" text="dark" className="small">
                      {privilege}
                    </Badge>
                  ))}
                  {userPrivileges.length > 2 && (
                    <Badge bg="light" text="dark" className="small">
                      +{userPrivileges.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Navigation Section */}
      <Nav
        className={`flex-grow-1 flex-column gap-1 mt-3 ${collapsed ? 'align-items-center' : ''}`}
        variant="pills"
        aria-label="Sidebar navigation"
        style={{ 
          padding: collapsed ? '0 0.2rem' : '0 0.5rem', 
          transition: 'padding 0.3s ease',
          overflowY: 'auto',
          minHeight: 0
        }}
      >
        {navItems.map(item => {
          const resolvedTo = getResolvedPath(item);
          const isActive = activePage === item.key;
          
          return (
            <Nav.Item key={item.key} className="w-100">
              <Nav.Link
                active={isActive}
                className={`d-flex align-items-center ${collapsed ? 'justify-content-center px-2' : 'gap-2 px-3'} py-3 rounded-4 sidebar-link`}
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                onClick={() => handleNavigate(resolvedTo)}
                style={{
                  ...NAV_ITEM_STYLE,
                  ...(isActive ? ACTIVE_NAV_STYLE : {}),
                  minWidth: collapsed ? 36 : 85,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '0.55rem 0.4rem' : '0.55rem 0.9rem',
                  position: 'relative'
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = HOVER_NAV_STYLE.background;
                    e.currentTarget.style.transform = HOVER_NAV_STYLE.transform;
                    e.currentTarget.style.boxShadow = HOVER_NAV_STYLE.boxShadow;
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    background: 'linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)',
                    borderRadius: '0 3px 3px 0',
                    boxShadow: '2px 0 8px rgba(255, 255, 255, 0.3)'
                  }} />
                )}
                
                <i 
                  className={`fas ${item.icon}`} 
                  style={{ 
                    fontSize: '1.1em', 
                    minWidth: 22, 
                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)', 
                    transition: 'all 0.3s ease', 
                    display: 'block', 
                    textAlign: 'center',
                    filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none'
                  }}
                />
                
                {!collapsed && (
                  <span style={{ 
                    fontSize: '0.9rem', 
                    whiteSpace: 'nowrap',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s ease',
                    textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                  }}>
                    {item.label}
                  </span>
                )}
              </Nav.Link>
            </Nav.Item>
          );
        })}

        {/* Show message if no accessible pages */}
        {navItems.length === 0 && !collapsed && (
          <div className="text-center p-3">
            <small className="text-white-50">
              No accessible pages for your role
            </small>
          </div>
        )}
      </Nav>

      {/* Logout Section - Fixed at bottom */}
      <div 
        className="p-3" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          flexShrink: 0,
          marginTop: 'auto'
        }}
      >
        <div style={{ 
          width: collapsed ? 36 : '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <Button
            variant="primary"
            className={`d-flex align-items-center justify-content-center fw-semibold ${collapsed ? '' : 'gap-3 w-100'} ${collapsed ? '' : 'px-0'}`}
            style={{
              ...LOGOUT_BTN_STYLE,
              padding: collapsed ? 0 : '0.65rem 0',
              width: collapsed ? 36 : '100%',
              height: collapsed ? 36 : 'auto',
              minWidth: collapsed ? 36 : undefined,
              minHeight: collapsed ? 36 : undefined,
              fontSize: '1em',
              boxShadow: '0 6px 20px 0 rgba(13,110,253,0.2)',
              borderRadius: collapsed ? '50%' : '10px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={onLogout}
            aria-label="Logout"
            title={collapsed ? 'Logout' : undefined}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(13,110,253,0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(13,110,253,0.2)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)';
            }}
          >
            {/* Button shine effect */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s ease',
                pointerEvents: 'none'
              }} 
              onMouseOver={e => e.currentTarget.style.left = '100%'}
            />
            
            <i 
              className="fas fa-sign-out-alt" 
              style={{ 
                fontSize: '1.2em', 
                margin: 0,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                transition: 'transform 0.3s ease'
              }}
            />
            
            {!collapsed && (
              <span style={{ 
                fontWeight: 700, 
                letterSpacing: '0.5px', 
                marginLeft: 10,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease',
                color: '#fff'
              }}>
                Logout
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;