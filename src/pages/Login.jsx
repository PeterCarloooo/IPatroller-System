import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useUserRole } from '../context/UserContext';

function Login() {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Attempt to sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      // 2. Immediately fetch the user's Firestore profile using their UID
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        setError('Your account is not yet registered. Please contact your administrator to register your account.');
        setLoading(false);
        return;
      }

      // 3. Continue with your role logic and navigation
      let role = '';
      if (formData.email === 'admin@admin.com') {
        role = 'Administrator';
      } else {
        role = 'User';
      }
      setUserRole(role);
      if (role === 'Administrator') {
        navigate('/dashboard');
      } else {
        navigate('/user-dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        default:
          setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: 0,
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10
      }}
    >
      <div className='card shadow-lg' style={{maxWidth: '500px', width: '100%', borderRadius: '1rem'}}>
        <div className='card-body p-5'>
          <div className="text-center">
            <div className="d-flex justify-content-center align-items-center mb-4">
              <div 
                style={{ 
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 auto'
                }}
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png"
                  alt="Bataan Seal"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
            <h2 className="fw-bold mb-2">Welcome to IPatroller</h2>
            <p className="text-muted mb-5">Please enter your login credentials</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 w-100">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4 w-100">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger text-center mb-4">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="btn btn-primary mb-4 w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login; 