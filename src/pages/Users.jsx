import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AddUserModal from '../components/AddUserModal';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
// No MDB imports

// Start with an empty users array
const initialUsers = [];

function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const functions = getFunctions();

  useEffect(() => {
    // Fetch users from Firestore on mount
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
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      // Optionally handle error
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
      <div className="bg-white shadow-sm rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-0">Users</h2>
          <p className="text-muted mb-0">Manage user accounts and permissions</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={openAddModal} type="button">
          <i className="fas fa-user-plus me-2"></i>
          Add New User
        </button>
      </div>
      <div className="row">
        <div className="col">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead>
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
                        <td>{user.role || '-'}</td>
                        <td>{user.status || '-'}</td>
                        <td>{user.municipality || '-'}</td>
                        <td>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => openEditModal(user)}>
                            <i className="fas fa-edit"></i> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddUser={handleAddUser}
        editUser={editUser}
        onEditUser={handleEditUser}
      />
    </DashboardLayout>
  );
}

export default Users; 