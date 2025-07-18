import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../api/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthContext = createContext(null);

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/ipatroller',
  '/illegals',
  '/command-center',
  '/report',
  '/setup'
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/signup'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            // Get additional user data from Firestore if needed
            // const userData = await getUserData(user.uid);
            setUser(user);

            // Redirect from auth routes if already authenticated
            if (AUTH_ROUTES.includes(location.pathname)) {
              const intendedPath = location.state?.from || '/dashboard';
              navigate(intendedPath, { replace: true });
            }
          } else {
            setUser(null);

            // Redirect to login if accessing protected route
            if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
              navigate('/login', {
                replace: true,
                state: { from: location.pathname }
              });
            }
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Auth observer error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, location]);

  // Reset error state after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check session expiration
  useEffect(() => {
    if (user) {
      const checkSession = setInterval(() => {
        if (auth.currentUser) {
          auth.currentUser.getIdTokenResult().then(idTokenResult => {
            const expirationTime = new Date(idTokenResult.expirationTime).getTime();
            const now = new Date().getTime();
            
            // If token expires in less than 5 minutes, refresh it
            if (expirationTime - now < 5 * 60 * 1000) {
              auth.currentUser.getIdToken(true).catch(error => {
                console.error('Token refresh error:', error);
                // Force logout if token refresh fails
                if (error.code === 'auth/requires-recent-login') {
                  auth.signOut();
                  navigate('/login', {
                    replace: true,
                    state: {
                      from: location.pathname,
                      message: 'Your session has expired. Please log in again.'
                    }
                  });
                }
              });
            }
          });
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkSession);
    }
  }, [user, navigate, location]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    clearError: () => setError(null)
  };

  if (loading) {
    return <LoadingSpinner message="Initializing application..." fullScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {error && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            backgroundColor: '#f44336',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 4,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {error}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 