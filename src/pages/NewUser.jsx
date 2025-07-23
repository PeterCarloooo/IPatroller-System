import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AddUserModal from '../components/AddUserModal';
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
      <div className="bg-white shadow-sm rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-0">Users</h2>
          <p className="text-muted mb-0">Manage user accounts and permissions</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowModal(true)} type="button">
          <i className="fas fa-user-plus me-2"></i>
          Add New User
        </button>
      </div>
      <AddUserModal isOpen={showModal} onClose={() => setShowModal(false)} onAddUser={handleAddUser} />
    </DashboardLayout>
  );
}

export default NewUser; 