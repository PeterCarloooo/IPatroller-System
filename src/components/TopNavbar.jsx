import React from 'react';
import { Button, Badge } from 'react-bootstrap';

const NAVBAR_TITLE_STYLE = { letterSpacing: '1px', fontFamily: 'inherit' };
const BADGE_STYLE = { fontSize: '0.95em', fontWeight: 600, letterSpacing: '0.5px', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.04)' };

function TopNavbar({ activePage, userName, userRole, onProfile }) {
  return (
    <nav className='top-navbar shadow-sm border-bottom border-2 border-light' style={{ borderRadius: '1.5rem', background: '#fff', marginBottom: '1.5rem', padding: '1rem 2rem', minHeight: 70, display: 'flex', alignItems: 'center', boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)' }}>
      <div className="container-fluid px-0">
        <div className="d-flex align-items-center justify-content-between w-100">
          <h4 className="fw-bold fs-4 mb-0" style={NAVBAR_TITLE_STYLE}>
            {activePage === 'settings' ? 'Settings' : 'Dashboard'}
          </h4>
          <div className="d-flex align-items-center">
            <div className="text-end me-3">
              <div className="text-muted d-flex align-items-center gap-2">
                {userName !== 'Administrator' && userName}
                {userRole === 'Administrator' && (
                  <Badge bg="primary" className="ms-2" style={BADGE_STYLE}>Admin</Badge>
                )}
              </div>
            </div>
            <Button
              variant="light"
              className="rounded-circle bg-primary bg-opacity-10 p-2 text-decoration-none border-0 shadow-sm"
              title="Profile"
              style={{ cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.04)' }}
              onClick={onProfile}
              aria-label="Open profile modal"
            >
              <i className="fas fa-user text-primary"></i>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopNavbar; 