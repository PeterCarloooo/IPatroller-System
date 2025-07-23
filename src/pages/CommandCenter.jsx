import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

function CommandCenter() {
  return (
    <DashboardLayout activePage="command-center">
      <div className="bg-white shadow-sm rounded-4 p-4 mb-4">
        <h2 className="fw-bold mb-0">Command Center</h2>
        <p className="text-muted mb-0">Centralized command and monitoring</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column align-items-center justify-content-center p-5">
              <div className="mb-4">
                <i className="fas fa-broadcast-tower text-primary fa-4x" style={{ opacity: 0.8 }}></i>
              </div>
              <h3 className="fw-bold mb-3">Coming Soon!</h3>
              <p className="text-muted text-center mb-4" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
                We're working hard to bring you a powerful command center for real-time operations.
              </p>
              <div className="d-flex justify-content-center align-items-center text-primary">
                <i className="fas fa-clock me-2"></i>
                <span>Feature Under Development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CommandCenter; 