import React from 'react';
import { Nav, Button, Stack } from 'react-bootstrap';

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
const SIDEBAR_HEADER_STYLE = { width: '54px', height: '54px', background: '#fff', border: '2px solid #e3e9f7', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' };
const NAVBAR_TITLE_STYLE = { letterSpacing: '2px', fontWeight: 700, fontFamily: 'inherit' };
const LOGOUT_BTN_STYLE = { fontSize: '1.08em', transition: 'background 0.2s', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.04)', padding: '0.75rem 0' };

function Sidebar({ activePage, userRole, isMobile, onNavigate, onLogout }) {
  return (
    <>
      <Stack direction="horizontal" gap={3} className="p-4 border-bottom bg-light align-items-center" style={{ borderTopRightRadius: isMobile ? 0 : '2rem', minHeight: 90, background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)', boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)' }}>
        <div style={SIDEBAR_HEADER_STYLE} className="rounded-circle d-flex align-items-center justify-content-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
            alt="Bataan Seal"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
        </div>
        {!isMobile && <span className="fs-3 fw-bold text-dark ms-3" style={NAVBAR_TITLE_STYLE}>IPatroller</span>}
      </Stack>
      <Nav className="flex-grow-1 flex-column gap-3 mt-4" variant="pills" aria-label="Sidebar navigation" style={{ padding: '0 0.5rem' }}>
        {SIDEBAR_NAV_ITEMS.map(item => {
          const resolvedTo = item.to === 'DYNAMIC_DASHBOARD'
            ? (userRole === 'User' ? '/user-dashboard' : '/dashboard')
            : item.to;
          return (
            <Nav.Item key={item.key}>
              <Nav.Link
                active={activePage === item.key}
                onClick={() => onNavigate(resolvedTo)}
                className="d-flex align-items-center gap-3 px-4 py-3 rounded-4 sidebar-link"
                tabIndex={0}
                aria-current={activePage === item.key ? 'page' : undefined}
                aria-label={item.label}
                style={{ fontSize: '1.13rem', fontWeight: 500, transition: 'background 0.2s, color 0.2s', marginBottom: 4 }}
              >
                <i className={`fas ${item.icon}`} style={{ fontSize: '1.5em', minWidth: 32 }}></i> <span>{item.label}</span>
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
      <div className="p-4 border-top bg-light mt-auto" style={{ borderBottomRightRadius: isMobile ? 0 : '2rem', background: '#f8fafc' }}>
        <Button variant="primary" className="d-flex align-items-center gap-2 w-100 justify-content-center fw-semibold" style={LOGOUT_BTN_STYLE} onClick={onLogout} aria-label="Logout">
          <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
        </Button>
      </div>
    </>
  );
}

export default Sidebar; 