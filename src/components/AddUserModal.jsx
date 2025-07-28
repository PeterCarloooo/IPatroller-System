import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/config';

function AddUserModal({ isOpen, onClose, onSave, editUser }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'User',
    municipality: '',
    status: 'Active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [municipalities, setMunicipalities] = useState([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);

  // Load municipalities from Firebase
  useEffect(() => {
    const loadMunicipalities = async () => {
      try {
        setLoadingMunicipalities(true);
        const querySnapshot = await getDocs(collection(db, 'municipality_privileges'));
        const muniData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // If no data in Firebase, use default municipalities
        if (muniData.length === 0) {
          const defaultMunicipalities = [
            { id: 1, name: 'ABUCAY', status: 'Active' },
            { id: 2, name: 'ORANI', status: 'Active' },
            { id: 3, name: 'SAMAL', status: 'Active' },
            { id: 4, name: 'HERMOSA', status: 'Active' },
            { id: 5, name: 'BALANGA', status: 'Active' },
            { id: 6, name: 'PILAR', status: 'Active' },
            { id: 7, name: 'ORION', status: 'Active' },
            { id: 8, name: 'LIMAY', status: 'Active' },
            { id: 9, name: 'BAGAC', status: 'Active' },
            { id: 10, name: 'DINALUPIHAN', status: 'Active' },
            { id: 11, name: 'MARIVELES', status: 'Active' },
            { id: 12, name: 'MORONG', status: 'Active' }
          ];
          setMunicipalities(defaultMunicipalities);
        } else {
          setMunicipalities(muniData);
        }
      } catch (error) {
        console.error('Error loading municipalities:', error);
        // Fallback to default municipalities
        const defaultMunicipalities = [
          { id: 1, name: 'ABUCAY', status: 'Active' },
          { id: 2, name: 'ORANI', status: 'Active' },
          { id: 3, name: 'SAMAL', status: 'Active' },
          { id: 4, name: 'HERMOSA', status: 'Active' },
          { id: 5, name: 'BALANGA', status: 'Active' },
          { id: 6, name: 'PILAR', status: 'Active' },
          { id: 7, name: 'ORION', status: 'Active' },
          { id: 8, name: 'LIMAY', status: 'Active' },
          { id: 9, name: 'BAGAC', status: 'Active' },
          { id: 10, name: 'DINALUPIHAN', status: 'Active' },
          { id: 11, name: 'MARIVELES', status: 'Active' },
          { id: 12, name: 'MORONG', status: 'Active' }
        ];
        setMunicipalities(defaultMunicipalities);
      } finally {
        setLoadingMunicipalities(false);
      }
    };

    if (isOpen) {
      loadMunicipalities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editUser) {
      setForm({
        firstName: editUser.firstName || '',
        lastName: editUser.lastName || '',
        email: editUser.email || '',
        password: '',
        role: editUser.role || 'User',
        municipality: editUser.municipality || '',
        status: editUser.status || 'Active'
      });
    } else {
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'User',
        municipality: '',
        status: 'Active'
      });
    }
    setError('');
    setSuccess('');
  }, [editUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editUser) {
        // Update existing user
        const userRef = doc(db, 'users', editUser.id);
        await updateDoc(userRef, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          municipality: form.municipality,
          status: form.status,
          updatedAt: new Date()
        });
        setSuccess('User updated successfully!');
      } else {
        // Create new user
        if (!form.password) {
          throw new Error('Password is required for new users');
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          municipality: form.municipality,
          status: form.status,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setSuccess('User created successfully!');
      }

      setTimeout(() => {
        handleClose();
        if (onSave) onSave();
      }, 1500);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '', role: 'User', municipality: '', status: 'Active' });
    setError('');
    setSuccess('');
    setLoading(false);
    onClose();
  };

  // Group municipalities by district
  const groupMunicipalitiesByDistrict = () => {
    const districts = {
      '1st District': ['ABUCAY', 'HERMOSA', 'ORANI', 'SAMAL'],
      '2nd District': ['BALANGA', 'LIMAY', 'ORION', 'PILAR'],
      '3rd District': ['BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG']
    };

    const grouped = {};
    municipalities.forEach(muni => {
      for (const [district, muniList] of Object.entries(districts)) {
        if (muniList.includes(muni.name)) {
          if (!grouped[district]) {
            grouped[district] = [];
          }
          grouped[district].push(muni);
          break;
        }
      }
    });

    return grouped;
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="md">
      <Modal.Header closeButton className="border-0 pb-0">
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
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="rounded-3 border-0 shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="lastName">
                <Form.Label className="fw-semibold">Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="rounded-3 border-0 shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="rounded-3 border-0 shadow-sm"
            />
          </Form.Group>

          {!editUser && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="rounded-3 border-0 shadow-sm"
              />
            </Form.Group>
          )}

          <Row className="mb-3">
            <Col md={6} className="mb-2 mb-md-0">
              <Form.Group controlId="role">
                <Form.Label className="fw-semibold">Role</Form.Label>
                <Form.Select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="rounded-3 border-0 shadow-sm"
                >
                  <option value="User">User</option>
                  <option value="Administrator">Administrator</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="status">
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="rounded-3 border-0 shadow-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Municipality</Form.Label>
            <Form.Select
              value={form.municipality}
              onChange={(e) => setForm({ ...form, municipality: e.target.value })}
              className="rounded-3 border-0 shadow-sm"
              disabled={loadingMunicipalities}
            >
              <option value="">
                {loadingMunicipalities ? 'Loading municipalities...' : 'Select Municipality'}
              </option>
              {!loadingMunicipalities && (() => {
                const grouped = groupMunicipalitiesByDistrict();
                return Object.entries(grouped).map(([district, muniList]) => (
                  <optgroup key={district} label={district}>
                    {muniList
                      .filter(muni => muni.status === 'Active')
                      .map(muni => (
                        <option key={muni.id} value={muni.name}>
                          {muni.name}
                        </option>
                      ))}
                  </optgroup>
                ));
              })()}
            </Form.Select>
            {loadingMunicipalities && (
              <small className="text-muted">
                <i className="fas fa-spinner fa-spin me-1"></i>
                Loading municipalities from system settings...
              </small>
            )}
          </Form.Group>
          {error && <Alert variant="danger" className="text-center mb-3">{error}</Alert>}
          {success && <Alert variant="success" className="text-center mb-3">{success}</Alert>}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-4 px-4 d-flex justify-content-end">
          <Button variant="secondary" className="px-4 py-2 rounded-3" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="px-4 py-2 rounded-3 ms-2" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                {editUser ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className={`fas fa-${editUser ? 'save' : 'user-plus'} me-2`}></i>
                {editUser ? 'Update User' : 'Create User'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddUserModal; 