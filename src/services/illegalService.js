import { 
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../api/firebase';

const COLLECTION_NAME = 'illegal_reports';

// Check authentication
const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('UNAUTHENTICATED');
  }
};

// Get all illegal reports
export const getIllegalReports = async () => {
  try {
    checkAuth();
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('dateReported', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching illegal reports:', error);
    if (error.message === 'UNAUTHENTICATED') {
      window.location.href = '/login';
      return [];
    }
    throw error;
  }
};

// Add a new illegal report
export const addIllegalReport = async (reportData) => {
  try {
    checkAuth();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...reportData,
      dateReported: serverTimestamp(),
      createdAt: serverTimestamp(),
      userId: auth.currentUser.uid
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding illegal report:', error);
    if (error.message === 'UNAUTHENTICATED') {
      window.location.href = '/login';
      return null;
    }
    throw error;
  }
};

// Update an existing illegal report
export const updateIllegalReport = async (reportId, reportData) => {
  try {
    checkAuth();
    const reportRef = doc(db, COLLECTION_NAME, reportId);
    await updateDoc(reportRef, {
      ...reportData,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid
    });
    return reportId;
  } catch (error) {
    console.error('Error updating illegal report:', error);
    if (error.message === 'UNAUTHENTICATED') {
      window.location.href = '/login';
      return null;
    }
    throw error;
  }
};

// Delete an illegal report
export const deleteIllegalReport = async (reportId) => {
  try {
    checkAuth();
    const reportRef = doc(db, COLLECTION_NAME, reportId);
    await deleteDoc(reportRef);
    return reportId;
  } catch (error) {
    console.error('Error deleting illegal report:', error);
    if (error.message === 'UNAUTHENTICATED') {
      window.location.href = '/login';
      return null;
    }
    throw error;
  }
}; 