import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // If still loading auth state, return nothing (or a loading spinner)
  if (isLoading) {
    return null;
  }

  // If not authenticated, redirect to login with return url
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute; 