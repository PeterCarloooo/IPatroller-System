import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';

function AddUserModal({ isOpen, onClose, onAddUser, editUser, onEditUser }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'User', municipality: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const uid = userCredential.user.uid;
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
        }, 500);
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

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="md" backdropClassName="modal-backdrop" contentClassName="border-0 shadow-lg rounded-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <Modal.Header closeButton className="border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
        <Modal.Title className="d-flex align-items-center fw-bold">
          <i className={`fas fa-${editUser ? 'user-edit' : 'user-plus'} me-2 text-primary`} />
          {editUser ? 'Edit User' : 'Add New User'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Modal.Body className="pt-3 pb-4 px-4">
          <Row className="mb-3">
            <Col md={6} className="mb-2 mb-md-0">
              <Form.Group controlId="firstName">
                <Form.Label className="fw-semibold">First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  required
                  size="lg"
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="lastName">
                <Form.Label className="fw-semibold">Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  required
                  size="lg"
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="fw-semibold">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              required
              size="lg"
              className="rounded-3"
              disabled={!!editUser}
            />
          </Form.Group>
          {!editUser && (
            <Form.Group className="mb-3" controlId="password">
              <Form.Label className="fw-semibold">Password</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  required
                  size="lg"
                  className="rounded-3"
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <Button
                  variant="outline-secondary"
                  className="border-0 bg-transparent input-group-text"
                  tabIndex={-1}
                  style={{ color: '#888', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </Button>
              </div>
            </Form.Group>
          )}
          <Form.Group className="mb-3" controlId="role">
            <Form.Label className="fw-semibold">Role</Form.Label>
            <Form.Select
              name="role"
              value={form.role}
              onChange={handleInputChange}
              size="lg"
              className="rounded-3"
            >
              <option value="User">User</option>
              <option value="Administrator">Administrator</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="municipality">
            <Form.Label className="fw-semibold">Municipality</Form.Label>
            <Form.Select
              name="municipality"
              value={form.municipality}
              onChange={handleInputChange}
              required
              size="lg"
              className="rounded-3"
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
            </Form.Select>
          </Form.Group>
          {error && <Alert variant="danger" className="text-center mb-3">{error}</Alert>}
          {success && <Alert variant="success" className="text-center mb-3">{success}</Alert>}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-4 px-4 d-flex justify-content-end">
          <Button variant="secondary" className="px-4 py-2 rounded-3" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="px-4 py-2 rounded-3 ms-2 d-flex align-items-center" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {editUser ? 'Saving...' : 'Creating User...'}
              </>
            ) : (
              <>
                <i className={`fas fa-${editUser ? 'save' : 'plus'} me-2`}></i>
                {editUser ? 'Save Changes' : 'Add User'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddUserModal; 