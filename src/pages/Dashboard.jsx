import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBBtn,
  MDBNavbar,
  MDBNavbarBrand
} from 'mdb-react-ui-kit';
import DashboardLayout from '../components/DashboardLayout';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [activeMunicipalities, setActiveMunicipalities] = useState([]);
  const [inactiveMunicipalities, setInactiveMunicipalities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to yesterday's date in YYYY-MM-DD format
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Helper to get all days in the current month
  function getDaysInMonth(year, month) {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  const now = new Date();
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());

  useEffect(() => {
    if (!selectedDate) return;
    async function fetchIpatrollerStatus() {
      // Query daily_counts for selectedDate
      const q = query(collection(db, 'daily_counts'), where('date', '==', selectedDate));
      const snapshot = await getDocs(q);
      let active = 0;
      let inactive = 0;
      let activeMuni = [];
      let inactiveMuni = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.count === 'number') {
          if (data.count >= 5) {
            active++;
            activeMuni.push({ name: data.municipality, count: data.count });
          } else {
            inactive++;
            inactiveMuni.push({ name: data.municipality, count: data.count });
          }
        }
      });
      setActiveCount(active);
      setInactiveCount(inactive);
      setActiveMunicipalities(activeMuni);
      setInactiveMunicipalities(inactiveMuni);
    }

    fetchIpatrollerStatus();
  }, [selectedDate]);

  // Sample data for statistics
  const stats = {
    totalReports: 156,
    pendingReports: 23,
    resolvedReports: 133,
    activePatrollers: 45,
    onDutyPatrollers: 12,
    totalAreas: 8
  };

  return (
    <DashboardLayout activePage="dashboard">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm rounded-4 p-4 mb-4 d-flex align-items-center gap-3">
        <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: 60, height: 60 }}>
          <MDBIcon fas icon="tachometer-alt" className="text-primary" size="2x" />
        </div>
        <div>
          <h2 className="fw-bold mb-1">Welcome back, Admin!</h2>
          <p className="text-muted mb-0">Here's what's happening in your patrol areas today.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <div className="rounded-circle p-3 bg-info bg-opacity-10 mb-2">
                <MDBIcon fas icon="file-alt" className="text-info" size="lg" />
              </div>
              <h6 className="fw-bold mb-1">Total Reports</h6>
              <h2 className="fw-bold mb-0 text-info">{stats.totalReports}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <div className="rounded-circle p-3 bg-warning bg-opacity-10 mb-2">
                <MDBIcon fas icon="hourglass-half" className="text-warning" size="lg" />
              </div>
              <h6 className="fw-bold mb-1">Pending Reports</h6>
              <h2 className="fw-bold mb-0 text-warning">{stats.pendingReports}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <div className="rounded-circle p-3 bg-success bg-opacity-10 mb-2">
                <MDBIcon fas icon="check-circle" className="text-success" size="lg" />
              </div>
              <h6 className="fw-bold mb-1">Resolved Reports</h6>
              <h2 className="fw-bold mb-0 text-success">{stats.resolvedReports}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <div className="rounded-circle p-3 bg-primary bg-opacity-10 mb-2">
                <MDBIcon fas icon="users" className="text-primary" size="lg" />
              </div>
              <h6 className="fw-bold mb-1">Active Patrollers</h6>
              <h2 className="fw-bold mb-0 text-primary">{stats.activePatrollers}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <div className="rounded-circle p-3 bg-success bg-opacity-10 mb-2">
                <MDBIcon fas icon="user-check" className="text-success" size="lg" />
              </div>
              <h6 className="fw-bold mb-1">On Duty</h6>
              <h2 className="fw-bold mb-0 text-success">{stats.onDutyPatrollers}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <div className="rounded-circle p-3 bg-secondary bg-opacity-10 mb-2">
                <MDBIcon fas icon="map-marker-alt" className="text-secondary" size="lg" />
              </div>
              <h6 className="fw-bold mb-1">Total Areas</h6>
              <h2 className="fw-bold mb-0 text-secondary">{stats.totalAreas}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <div className="rounded-circle p-3 bg-success bg-opacity-10 mb-2">
                <MDBIcon fas icon="user-check" className="text-success" size="lg" />
              </div>
              <h6 className="fw-bold mb-1">Active Patrollers (Yesterday)</h6>
              <h2 className="fw-bold mb-0 text-success">{activeCount}</h2>
              <span className="badge bg-success bg-opacity-75 mt-2">5 Above</span>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <div className="rounded-circle p-3 bg-danger bg-opacity-10 mb-2">
                <MDBIcon fas icon="user-times" className="text-danger" size="lg" />
              </div>
              <h6 className="fw-bold mb-1">Inactive Patrollers (Yesterday)</h6>
              <h2 className="fw-bold mb-0 text-danger">{inactiveCount}</h2>
              <span className="badge bg-danger bg-opacity-75 mt-2">4 Below</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <h5 className="fw-bold mb-0">Recent Activity <span className="badge bg-primary bg-opacity-75 ms-2">{selectedDate}</span></h5>
            <select
              className="form-select w-auto"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            >
              <option value="">Select a date</option>
              {daysInMonth.map((date, idx) => {
                const value = date.toISOString().slice(0, 10);
                const isToday = value === new Date().toISOString().slice(0, 10);
                return (
                  <option key={idx} value={value}>
                    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {isToday ? ' (Today)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mb-2 fw-semibold text-success">Active Municipalities <span className="badge bg-success bg-opacity-75 ms-1">{activeMunicipalities.length}</span></div>
              {activeMunicipalities.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {activeMunicipalities.map((muni, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-2 py-2">
                      <span>{muni.name}</span>
                      <span className="badge bg-success bg-opacity-75">{muni.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">No active municipalities today.</div>
              )}
            </div>
            <div className="col-md-6">
              <div className="mb-2 fw-semibold text-danger">Inactive Municipalities <span className="badge bg-danger bg-opacity-75 ms-1">{inactiveMunicipalities.length}</span></div>
              {inactiveMunicipalities.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {inactiveMunicipalities.map((muni, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-2 py-2">
                      <span>{muni.name}</span>
                      <span className="badge bg-danger bg-opacity-75">{muni.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">No inactive municipalities today.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard; 