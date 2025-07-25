import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AddUserModal from '../components/AddUserModal';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Container, Card, Table, Button, Row, Col, Badge, Stack } from 'react-bootstrap';

const initialUsers = [];

function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const functions = getFunctions();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchUsers();
  }, []);

  const handleAddUser = (user) => {
    setUsers(prev => [
      ...prev,
      user
    ]);
  };

  const handleEditUser = (user) => {
    setUsers(prev => prev.map(u => (u.id === user.id ? user : u)));
    setEditUser(null);
  };

  const handleDeleteUser = async (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    try {
      const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
      await deleteUserAccount({ uid: userId });
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      alert('Failed to delete user: ' + (err.message || err));
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditUser(null);
    setShowModal(true);
  };

  return (
    <DashboardLayout activePage="users">
      <Container fluid className="py-4" style={{ minHeight: '100vh' }}>
        <Card className="mb-4 border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center justify-content-between" style={{ background: 'linear-gradient(90deg, #e3e9f7 60%, #f8fafc 100%)' }}>
          <div>
            <h2 className="fw-bold mb-0">Users</h2>
            <p className="text-muted mb-0">Manage user accounts and permissions</p>
          </div>
          <Button variant="primary" className="d-flex align-items-center px-4 py-2 rounded-3 fw-semibold" onClick={openAddModal}>
            <i className="fas fa-user-plus me-2"></i>
            Add New User
          </Button>
        </Card>
        <Row>
          <Col>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body>
                <div className="table-responsive">
                  <Table hover responsive className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Municipality</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <tr key={user.id}>
                          <td>{idx + 1}</td>
                          <td>{user.firstName || '-'}</td>
                          <td>{user.lastName || '-'}</td>
                          <td>{user.email || '-'}</td>
                          <td><Badge bg={user.role === 'Administrator' ? 'primary' : 'secondary'}>{user.role || '-'}</Badge></td>
                          <td><Badge bg={user.status === 'Active' ? 'success' : 'secondary'}>{user.status || '-'}</Badge></td>
                          <td>{user.municipality || '-'}</td>
                          <td>
                            <Stack direction="horizontal" gap={2}>
                              <Button variant="warning" size="sm" className="d-flex align-items-center px-3 rounded-3 fw-semibold" onClick={() => openEditModal(user)}>
                                <i className="fas fa-edit me-1"></i> Edit
                              </Button>
                              {/* <Button variant="danger" size="sm" className="d-flex align-items-center px-3 rounded-3 fw-semibold" onClick={() => handleDeleteUser(user.id)}>
                                <i className="fas fa-trash-alt me-1"></i> Delete
                              </Button> */}
                            </Stack>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <AddUserModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAddUser={handleAddUser}
          editUser={editUser}
          onEditUser={handleEditUser}
        />
      </Container>
    </DashboardLayout>
  );
}

export default Users; 