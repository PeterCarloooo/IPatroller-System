import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import IPatrollerStatus from './pages/IPatrollerStatus';
import IncidentsReports from './pages/PNPIncidents';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Setups from './pages/Setups';
import CommandCenter from './pages/CommandCenter';
import ChangePassword from './pages/ChangePassword';
import NewUser from './pages/NewUser';
import UserDashboard from './pages/UserDashboard';
import { useUserRole } from './context/UserContext';

function ProtectedRoute({ children, adminOnly }) {
  const { userRole } = useUserRole();
  const location = useLocation();
  if (!userRole) return children; // allow until role is loaded
  if (adminOnly && userRole !== 'Administrator') {
    return <Navigate to="/user-dashboard" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/settings" element={
          <ProtectedRoute adminOnly={true}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/ipatroller-status" element={
          <ProtectedRoute adminOnly={true}>
            <IPatrollerStatus />
          </ProtectedRoute>
        } />
        <Route path="/incidents-reports" element={
          <ProtectedRoute adminOnly={true}>
            <IncidentsReports />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute adminOnly={true}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute adminOnly={true}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/users/new" element={
          <ProtectedRoute adminOnly={true}>
            <NewUser />
          </ProtectedRoute>
        } />
        <Route path="/setups" element={
          <ProtectedRoute adminOnly={true}>
            <Setups />
          </ProtectedRoute>
        } />
        <Route path="/command-center" element={
          <ProtectedRoute adminOnly={true}>
            <CommandCenter />
          </ProtectedRoute>
        } />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
