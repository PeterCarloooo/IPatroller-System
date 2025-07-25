import React, { useState } from 'react';
import { Nav, Button, Stack } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

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

function Sidebar({ activePage, userRole, isMobile, onLogout, collapsed, setCollapsed }) {
  return (
    <div
      className="sidebar-collapsible d-flex flex-column align-items-stretch"
      style={{
        width: collapsed ? 60 : 220,
        minWidth: collapsed ? 60 : 220,
        maxWidth: collapsed ? 60 : 220,
        background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
        transition: 'width 0.25s cubic-bezier(.4,2,.6,1), min-width 0.25s cubic-bezier(.4,2,.6,1), max-width 0.25s cubic-bezier(.4,2,.6,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        height: '100vh',
      }}
    >
      <div className="d-flex flex-column align-items-center w-100" style={{ padding: collapsed ? '1.2rem 0.5rem 0.5rem 0.5rem' : '1.7rem 1.2rem 0.5rem 1.2rem', transition: 'padding 0.2s' }}>
        <div style={{ ...SIDEBAR_HEADER_STYLE, width: 56, height: 56, border: '2.5px solid #e3e9f7', background: '#fff', boxShadow: '0 2px 8px 0 rgba(13,110,253,0.10)' }} className="rounded-circle d-flex align-items-center justify-content-center mb-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
            alt="Bataan Seal"
            style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: '50%' }}
          />
        </div>
        {!isMobile && !collapsed && (
          <>
            <span className="fs-5 fw-bold text-dark" style={{ ...NAVBAR_TITLE_STYLE, fontWeight: 700, letterSpacing: '2px', textShadow: '0 1px 2px #e3e9f7' }}>IPatroller</span>
            <span className="text-muted" style={{ fontSize: '0.95em', fontWeight: 500, letterSpacing: '0.5px', marginTop: '-2px' }}>Province of Bataan</span>
          </>
        )}
      </div>
      <div style={{ height: 1, width: '100%', background: '#e3e9f7', margin: '0.5rem 0 0.5rem 0', opacity: 0.7 }} />
      <Nav
        className={`flex-grow-1 flex-column gap-3 mt-2 ${collapsed ? 'align-items-center' : ''}`}
        variant="pills"
        aria-label="Sidebar navigation"
        style={{ padding: collapsed ? '0 0.2rem' : '0 0.5rem', transition: 'padding 0.2s' }}
      >
        {(userRole === 'User'
          ? SIDEBAR_NAV_ITEMS.filter(item => ['dashboard', 'command-center', 'settings'].includes(item.key))
          : SIDEBAR_NAV_ITEMS
        ).map(item => {
          const resolvedTo = item.to === 'DYNAMIC_DASHBOARD'
            ? (userRole === 'User' ? '/user-dashboard' : '/dashboard')
            : item.to;
          return (
            <Nav.Item key={item.key} className="w-100">
              <NavLink
                to={resolvedTo}
                className={({ isActive }) =>
                  `d-flex align-items-center ${collapsed ? 'justify-content-center px-2' : 'gap-2 px-3'} py-2 rounded-4 sidebar-link` +
                  (isActive ? ' active' : '')
                }
                tabIndex={0}
                aria-label={item.label}
                style={{
                  fontSize: '1.02rem',
                  fontWeight: 500,
                  transition: 'background 0.2s, color 0.2s, min-width 0.2s',
                  marginBottom: 2,
                  minWidth: collapsed ? 44 : 90,
                  background: 'transparent',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  textDecoration: 'none',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(13,110,253,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <i className={`fas ${item.icon}`} style={{ fontSize: '1.1em', minWidth: 22, color: activePage === item.key ? '#0d6efd' : '#6c757d', transition: 'color 0.2s', display: 'block', textAlign: 'center' }}></i>
                {!collapsed && <span style={{ fontSize: '1.02rem', whiteSpace: 'nowrap' }}>{item.label}</span>}
              </NavLink>
            </Nav.Item>
          );
        })}
      </Nav>
      <div className={`p-4 border-top bg-light mt-auto`} style={{ background: '#f8fafc', transition: 'padding 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: collapsed ? 44 : '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            variant="primary"
            className={`d-flex align-items-center justify-content-center fw-semibold ${collapsed ? '' : 'gap-3 w-100'} ${collapsed ? '' : 'px-0'}`}
            type="button"
            style={{
              ...LOGOUT_BTN_STYLE,
              padding: collapsed ? 0 : '0.85rem 0',
              width: collapsed ? 44 : '100%',
              height: collapsed ? 44 : 'auto',
              minWidth: collapsed ? 44 : undefined,
              minHeight: collapsed ? 44 : undefined,
              fontSize: '1.13em',
              boxShadow: '0 4px 16px 0 rgba(13,110,253,0.10)',
              borderRadius: collapsed ? '50%' : '0.95rem',
              transition: 'background 0.2s, box-shadow 0.2s, width 0.2s',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={e => { e.preventDefault(); e.stopPropagation(); if (typeof onLogout === 'function') onLogout(); }}
            aria-label="Logout"
            title={collapsed ? 'Logout' : undefined}
            onMouseOver={e => e.currentTarget.style.background = '#0b5ed7'}
            onMouseOut={e => e.currentTarget.style.background = ''}
          >
            <i className="fas fa-sign-out-alt" style={{ fontSize: '1.2em', margin: 0 }}></i>
            {!collapsed && <span style={{ fontWeight: 700, letterSpacing: '0.5px', marginLeft: 10 }}>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;