import React from 'react';

export default function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
      <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
        <i className={`fas ${icon} text-primary fs-4`}></i>
      </div>
      <div>
        <h2 className="fw-bold mb-0 fs-4">{title}</h2>
        <p className="text-muted mb-0 small">{subtitle}</p>
      </div>
    </div>
  );
} 