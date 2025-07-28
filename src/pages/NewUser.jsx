import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AddUserModal from '../components/AddUserModal';
import { Container, Card, Stack, Button } from 'react-bootstrap';
// No MDB imports

// Start with an empty users array
const initialUsers = [];

// Firebase Auth + Firestore registration utility
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

async function registerUser(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid; // This is the Firebase Auth UID
  await setDoc(doc(db, "users", uid), {
    email: userCredential.user.email,
    displayName: "New User",
    createdAt: new Date(),
  });
}

function NewUser() {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);

  const handleAddUser = (user) => {
    setUsers(prev => [
      ...prev,
      { ...user, id: prev.length + 1, status: 'Active' }
    ]);
  };

  return (
    <DashboardLayout activePage="users">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72 }}>
          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-users text-primary fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Add New User</h2>
            <p className="text-muted mb-0 small">Register a new user account</p>
          </div>
        </div>
        {/* Debug Header - Remove this later */}
        <div className="alert alert-info mb-3" style={{ visibility: 'visible', opacity: 1 }}>
          <strong>New User Content Loaded Successfully!</strong> If you can see this message, the New User page is working.
        </div>
        
        <Card className="mb-4 border-0 shadow-sm rounded-4 p-4" style={{ width: '100%', height: '100%', margin: 0, borderRadius: '1rem', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', visibility: 'visible', opacity: 1 }}>
          <Stack direction="horizontal" gap={3} className="align-items-center flex-wrap">
            <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
              <i className="fas fa-users text-primary" style={{ fontSize: '1.7rem' }}></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0" style={{ fontSize: '1.6rem', letterSpacing: '0.5px' }}>Users</h2>
              <p className="text-muted mb-0" style={{ fontSize: '1.05rem' }}>Manage user accounts and permissions</p>
            </div>
          </Stack>
          <div className="d-grid gap-2 d-md-block">
            <Button variant="primary" className="d-flex align-items-center px-4 py-2 rounded-3 fw-semibold" onClick={() => setShowModal(true)} type="button">
              <i className="fas fa-user-plus me-2"></i>
              Add New User
            </Button>
          </div>
        </Card>
        <AddUserModal isOpen={showModal} onClose={() => setShowModal(false)} onAddUser={handleAddUser} />
      </div>
    </DashboardLayout>
  );
}

export default NewUser; 