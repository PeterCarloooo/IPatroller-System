import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { setDoc, doc, collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
// Removed all MDB imports

function AddUserModal({ isOpen, onClose, onAddUser, editUser, onEditUser }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'User', municipality: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (editUser) {
      setForm({
        firstName: editUser.firstName || '',
        lastName: editUser.lastName || '',
        email: editUser.email || '',
        password: '',
        role: editUser.role || 'User',
        municipality: editUser.municipality || ''
      });
    } else {
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'User', municipality: '' });
    }
    setError('');
    setSuccess('');
    setLoading(false);
  }, [editUser, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!form.firstName || !form.lastName || !form.email || (!editUser && !form.password) || !form.role || !form.municipality) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    try {
      if (editUser) {
        onEditUser({ ...editUser, ...form });
        setLoading(false);
        handleClose();
      } else {
        // Create user in Firebase Auth first
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const uid = userCredential.user.uid;
        // Save to Firestore with UID as document ID
        await setDoc(doc(db, 'users', uid), {
          firstName: form.firstName || '',
          lastName: form.lastName || '',
          email: form.email,
          role: form.role || 'User',
          municipality: form.municipality || '',
          status: 'Active',
          createdAt: new Date(),
          id: uid
        });
        setSuccess('User added successfully!');
        onAddUser({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          role: form.role,
          municipality: form.municipality,
          id: uid,
          status: 'Active'
        });
        setLoading(false);
        setTimeout(() => {
          handleClose();
        }, 500); // You can increase this to 1500 or 2000 for a longer message display
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError('Failed to add user: ' + err.message);
      }
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '', role: 'User', municipality: '' });
    setError('');
    setSuccess('');
    setLoading(false);
    onClose();
  };

  // Only render modal if isOpen
  if (!isOpen) return null;

  return (
    <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 p-2" style={{ background: '#fff' }}>
          <div className="modal-header border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
            <h5 className="modal-title d-flex align-items-center fw-bold">
              <i className={`fas fa-${editUser ? 'user-edit' : 'user-plus'} me-2 text-primary`} />
              {editUser ? 'Edit User' : 'Add New User'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="modal-body pt-3 pb-4 px-4">
              <div className="row mb-3">
                <div className="col-md-6 mb-2 mb-md-0">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-3"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-3"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg rounded-3"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  disabled={!!editUser}
                />
              </div>
              {!editUser && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control form-control-lg rounded-3"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-0 bg-transparent input-group-text"
                      tabIndex={-1}
                      style={{ color: '#888', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>
              )}
              <div className="mb-3">
                <label className="form-label fw-semibold">Role</label>
                <select
                  className="form-select form-select-lg rounded-3"
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                >
                  <option value="User">User</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Municipality</label>
                <select
                  className="form-select form-select-lg rounded-3"
                  name="municipality"
                  value={form.municipality}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Municipality</option>
                  <optgroup label="1st District">
                    <option value="Abucay">Abucay</option>
                    <option value="Hermosa">Hermosa</option>
                    <option value="Orani">Orani</option>
                    <option value="Samal">Samal</option>
                  </optgroup>
                  <optgroup label="2nd District">
                    <option value="Balanga">Balanga</option>
                    <option value="Limay">Limay</option>
                    <option value="Orion">Orion</option>
                    <option value="Pilar">Pilar</option>
                  </optgroup>
                  <optgroup label="3rd District">
                    <option value="Bagac">Bagac</option>
                    <option value="Dinalupihan">Dinalupihan</option>
                    <option value="Mariveles">Mariveles</option>
                    <option value="Morong">Morong</option>
                  </optgroup>
                </select>
              </div>
              {error && <div className="alert alert-danger text-center mb-3">{error}</div>}
              {success && <div className="alert alert-success text-center mb-3">{success}</div>}
            </div>
            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-3" onClick={handleClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 ms-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {editUser ? 'Saving...' : 'Creating User...'}
                  </>
                ) : (
                  <>
                    <i className={`fas fa-${editUser ? 'save' : 'plus'} me-2`}></i>
                    {editUser ? 'Save Changes' : 'Add User'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUserModal; 