import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Get additional user data from Firestore
          const userData = await authService.getCurrentUser();
          if (userData) {
            setCurrentUser(userData);
          } else {
            // If no Firestore data, sign out
            await authService.logout();
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const user = await authService.login(username, password);
      setCurrentUser(user);
      navigate('/dashboard');
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Signup function
  const signup = async (username, password) => {
    try {
      const result = await authService.signup(username, password);
      // Don't set current user yet - require email verification
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Password reset function
  const resetPassword = async (username) => {
    try {
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