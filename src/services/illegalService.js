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
import { db } from '../api/firebase';

const COLLECTION_NAME = 'illegal_reports';

// Get all illegal reports
export const getIllegalReports = async () => {
  try {
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
    throw error;
  }
};

// Add a new illegal report
export const addIllegalReport = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...reportData,
      dateReported: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding illegal report:', error);
    throw error;
  }
};

// Update an existing illegal report
export const updateIllegalReport = async (reportId, reportData) => {
  try {
    const reportRef = doc(db, COLLECTION_NAME, reportId);
    await updateDoc(reportRef, {
      ...reportData,
      updatedAt: serverTimestamp()
    });
    return reportId;
  } catch (error) {
    console.error('Error updating illegal report:', error);
    throw error;
  }
};

// Delete an illegal report
export const deleteIllegalReport = async (reportId) => {
  try {
    const reportRef = doc(db, COLLECTION_NAME, reportId);
    await deleteDoc(reportRef);
    return reportId;
  } catch (error) {
    console.error('Error deleting illegal report:', error);
    throw error;
  }
}; 