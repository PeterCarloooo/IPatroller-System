import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db, rtdb } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as dbRef, onDisconnect, set as rtdbSet, serverTimestamp } from 'firebase/database';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'User');
        } else {
          setUserRole('User');
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserContext);
} 