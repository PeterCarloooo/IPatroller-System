import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ChangePasswordTest from './ChangePasswordTest';

function ChangePasswordPage() {
  const [showChangePassword, setShowChangePassword] = useState(true);

  const handleClose = () => {
    setShowChangePassword(false);
    // Navigate back to settings or dashboard
    window.history.back();
  };

  return (
    <DashboardLayout activePage="settings">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-key text-primary fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Change Password</h2>
            <p className="text-muted mb-0 small">Update your account password</p>
          </div>
        </div>

        <ChangePasswordTest isOpen={showChangePassword} onClose={handleClose} />
      </div>
    </DashboardLayout>
  );
}

export default ChangePasswordPage; 