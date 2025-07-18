import { db } from '../api/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

class IllegalService {
  constructor() {
    this.collectionName = 'illegal_reports';
    // Bind methods to ensure proper 'this' context
    this.getIllegalReports = this.getIllegalReports.bind(this);
    this.createIllegalReport = this.createIllegalReport.bind(this);
    this.updateIllegalReport = this.updateIllegalReport.bind(this);
    this.deleteIllegalReport = this.deleteIllegalReport.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  async getIllegalReports() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error in getIllegalReports:', error);
      throw this.handleError(error);
    }
  }

  async createIllegalReport(data) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...data
      };
    } catch (error) {
      console.error('Error in createIllegalReport:', error);
      throw this.handleError(error);
    }
  }

  async updateIllegalReport(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return {
        id,
        ...data
      };
    } catch (error) {
      console.error('Error in updateIllegalReport:', error);
      throw this.handleError(error);
    }
  }

  async deleteIllegalReport(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error in deleteIllegalReport:', error);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    console.error('Service error:', error);
    
    if (error.code === 'permission-denied') {
      return new Error('You do not have permission to perform this action');
    }
    
    if (error.code === 'not-found') {
      return new Error('The requested resource was not found');
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export default new IllegalService(); 