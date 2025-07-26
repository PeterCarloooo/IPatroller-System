import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Table, Badge, Stack, Alert } from 'react-bootstrap';
import AddUserModal from '../components/AddUserModal';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useUserRole } from '../context/UserContext';

function Users() {
  const [users, setUsers] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { 
    userRole, 
    userMunicipality, 
    canAccessFeature, 
    canPerformAction,
    getAccessibleMunicipalities 
  } = useUserRole();

  useEffect(() => {
    fetchUsers();
    fetchMunicipalities();
  }, []);

  const fetchUsers = async () => {
    try {
      let usersQuery;
      
      // Filter users based on user's access level
      if (userRole === 'Administrator') {
        // Administrators can see all users
        usersQuery = collection(db, 'users');
      } else {
        // Regular users can only see users from their municipality
        usersQuery = query(collection(db, 'users'), where('municipality', '==', userMunicipality));
      }
      
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMunicipalities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'municipality_privileges'));
      const muniData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMunicipalities(muniData);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    }
  };

  const handleEdit = (user) => {
    // Check if user can edit this specific user
    if (!canPerformAction('update', 'user', user)) {
      alert('You do not have permission to edit this user.');
      return;
    }
    setEditUser(user);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    // Check if user can delete users
    if (!canAccessFeature('delete-user')) {
      alert('You do not have permission to delete users.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const openAddModal = () => {
    // Check if user can add new users
    if (!canAccessFeature('add-user')) {
      alert('You do not have permission to add new users.');
      return;
    }
    setEditUser(null);
    setShowModal(true);
  };

  // Get municipality privileges for a user
  const getUserMunicipalityPrivileges = (userMunicipality) => {
    if (!userMunicipality || userMunicipality === 'Administrator') return [];
    const municipality = municipalities.find(m => m.name === userMunicipality);
    return municipality ? municipality.privileges || [] : [];
  };

  // Get users count by municipality
  const getUsersByMunicipality = () => {
    const counts = {};
    users.forEach(user => {
      if (user.municipality) {
        counts[user.municipality] = (counts[user.municipality] || 0) + 1;
      }
    });
    return counts;
  };

  const usersByMunicipality = getUsersByMunicipality();

  // Check if user has access to this page
  if (!canAccessFeature('view-users')) {
    return (
      <DashboardLayout activePage="users">
        <div className="page-container">
          <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '3.5rem' }}>
            <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
              <i className="fas fa-users text-primary fs-4"></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0 fs-4">Users</h2>
              <p className="text-muted mb-0 small">Manage user accounts and permissions</p>
            </div>
          </div>
          
          <Alert variant="warning" className="text-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Access Denied</strong>
            <br />
            You do not have permission to view the Users page. Please contact your administrator.
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="users">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '3.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-users text-primary fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Users</h2>
            <p className="text-muted mb-0 small">Manage user accounts and permissions</p>
          </div>
        </div>

        {/* Access Level Notice */}
        {userRole !== 'Administrator' && (
          <Alert variant="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Limited Access:</strong> You can only view and manage users from your municipality ({userMunicipality}).
          </Alert>
        )}

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h4 className="text-primary mb-1">{users.length}</h4>
                <small className="text-muted">Total Users</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h4 className="text-success mb-1">
                  {users.filter(user => user.status === 'Active').length}
                </h4>
                <small className="text-muted">Active Users</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h4 className="text-warning mb-1">
                  {users.filter(user => user.role === 'Administrator').length}
                </h4>
                <small className="text-muted">Administrators</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h4 className="text-info mb-1">{Object.keys(usersByMunicipality).length}</h4>
                <small className="text-muted">Municipalities with Users</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Add User Button - Only show if user has permission */}
        {canAccessFeature('add-user') && (
          <div className="d-flex justify-content-end mb-4">
            <Button variant="primary" className="d-flex align-items-center px-4 py-2 rounded-3 fw-semibold" onClick={openAddModal}>
              <i className="fas fa-user-plus me-2"></i>
              Add New User
            </Button>
          </div>
        )}
        
        <Card className="shadow-sm border-0 rounded-3">
          <Card.Body className="p-3">
            <div className="table-responsive">
              <Table hover responsive className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Municipality</th>
                    <th>Privileges</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const userPrivileges = getUserMunicipalityPrivileges(user.municipality);
                    const canEdit = canPerformAction('update', 'user', user);
                    const canDelete = canAccessFeature('delete-user');
                    
                    return (
                      <tr key={user.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <div>
                            <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                            <small className="text-muted">{user.location || 'Location not set'}</small>
                          </div>
                        </td>
                        <td>{user.email || '-'}</td>
                        <td>
                          <Badge bg={user.role === 'Administrator' ? 'primary' : 'secondary'}>
                            {user.role || '-'}
                          </Badge>
                        </td>
                        <td>
                          {user.role === 'Administrator' ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg={user.status === 'Active' ? 'success' : 'danger'}>
                              {user.status === 'Active' ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </td>
                        <td>
                          {user.municipality ? (
                            <div>
                              <div className="fw-semibold">{user.municipality}</div>
                              <small className="text-muted">
                                {usersByMunicipality[user.municipality] || 0} user(s)
                              </small>
                            </div>
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                        <td>
                          {user.role === 'Administrator' ? (
                            <Badge bg="primary">All Privileges</Badge>
                          ) : userPrivileges.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {userPrivileges.slice(0, 2).map((privilege, idx) => (
                                <Badge key={idx} bg="info" className="small">
                                  {privilege}
                                </Badge>
                              ))}
                              {userPrivileges.length > 2 && (
                                <Badge bg="secondary" className="small">
                                  +{userPrivileges.length - 2} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">No privileges</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {canEdit && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEdit(user)}
                                className="btn-sm"
                                title="Edit User"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                className="btn-sm"
                                title="Delete User"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            )}
                            {!canEdit && !canDelete && (
                              <span className="text-muted small">No actions available</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {users.length === 0 && !loading && (
              <div className="text-center py-5">
                <i className="fas fa-users text-muted fs-1 mb-3"></i>
                <h5 className="text-muted">No users found</h5>
                <p className="text-muted">
                  {userRole === 'Administrator' 
                    ? 'Start by adding your first user account.' 
                    : `No users found in your municipality (${userMunicipality}).`
                  }
                </p>
                {canAccessFeature('add-user') && (
                  <Button variant="primary" onClick={openAddModal}>
                    <i className="fas fa-user-plus me-2"></i>
                    Add First User
                  </Button>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
        
        <AddUserModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={fetchUsers}
          editUser={editUser}
        />
      </div>
    </DashboardLayout>
  );
}

export default Users; 