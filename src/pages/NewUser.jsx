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
      <Container fluid className="py-4 px-2 px-md-4">
        <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light bg-opacity-75 p-4 d-flex flex-row align-items-center justify-content-between">
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
      </Container>
    </DashboardLayout>
  );
}

export default NewUser; 