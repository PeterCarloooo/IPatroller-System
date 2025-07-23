import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

function UserDashboard() {
  return (
    <DashboardLayout activePage="dashboard">
      <div className="bg-white shadow-sm rounded-4 p-4 mb-4">
        <h2 className="fw-bold mb-0">Welcome, User!</h2>
        <p className="text-muted mb-3">This is your limited dashboard. Please contact your administrator if you need more access.</p>
      </div>
      <div className="row g-4 mb-4">
        <div className="col-md-8 mx-auto">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center p-5">
              <div className="mb-4">
                <i className="fas fa-user text-primary fa-4x" style={{ opacity: 0.8 }}></i>
              </div>
              <h3 className="fw-bold mb-3">Welcome to the iPatroller System</h3>
              <p className="text-muted text-center mb-4" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
                Here you can view your assigned patrols, receive updates, and access important information. If you need additional features or permissions, please contact your system administrator.
              </p>
              <div className="d-flex justify-content-center align-items-center text-primary">
                <i className="fas fa-info-circle me-2" />
                <span>Dashboard access only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserDashboard; 