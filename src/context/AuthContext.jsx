import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../api/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Debounced navigation to prevent throttling
  const debouncedNavigate = useCallback((path) => {
    setTimeout(() => {
      navigate(path);
    }, 100);
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!mounted) return;

      setCurrentUser(user);
      setLoading(false);

      // If user is logged in and on login/signup page, redirect to dashboard
      if (user && ['/login', '/signup'].includes(location.pathname)) {
        debouncedNavigate('/dashboard');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [location, debouncedNavigate]);

  // Login function
  const login = async (username, password) => {
    try {
      const user = await authService.login(username, password);
      setCurrentUser(user);
      debouncedNavigate('/dashboard');
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Signup function
  const signup = async (username, password) => {
    try {
      // Check if username exists first
      const exists = await authService.checkUsernameExists(username);
      if (exists) {
        throw new Error('This username is already taken');
      }

      const user = await authService.signup(username, password);
      // After successful signup, automatically log in
      if (user) {
        setCurrentUser(user);
        debouncedNavigate('/dashboard');
      }
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      debouncedNavigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Password reset function
  const resetPassword = async (username) => {
    try {
      // Check if username exists first
      const exists = await authService.checkUsernameExists(username);
      if (!exists) {
        throw new Error('Username not found');
      }
      await authService.sendPasswordReset(username);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading: loading,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 