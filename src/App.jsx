import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import IPatrollerStatus from './pages/IPatrollerStatus.jsx';
import Reports from './pages/Reports.jsx';
import Setups from './pages/Setups.jsx';
import Profile from './pages/Profile.jsx';
import Add from './pages/add.jsx';
import IncidentsReports from './pages/Incidentsreports.jsx';
import CommandCenter from './pages/CommandCenter.jsx';
import Users from './pages/Users.jsx';
import NewUser from './pages/NewUser.jsx';
import Settings from './pages/Settings.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/ipatroller-status" element={<IPatrollerStatus />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/setups" element={<Setups />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add" element={<Add />} />
        <Route path="/incidents-reports" element={<IncidentsReports />} />
        <Route path="/command-center" element={<CommandCenter />} />
        <Route path="/users" element={<Users />} />
        <Route path="/new-user" element={<NewUser />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
