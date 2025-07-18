import { db } from '../api/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

class FirestoreService {
  constructor() {
    // Collection names
    this.collections = {
      users: 'users',
      patrollers: 'patrollers',
      incidents: 'incidents',
      reports: 'reports',
      locations: 'locations',
      schedules: 'schedules'
    };
  }

  // Users Collection Operations
  async createUser(userId, userData) {
    try {
      await setDoc(doc(db, this.collections.users, userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      await updateDoc(doc(db, this.collections.users, userId), {
        ...userData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, this.collections.users, userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Patrollers Collection Operations
  async createPatroller(patrollerData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.patrollers), {
        ...patrollerData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating patroller:', error);
      throw error;
    }
  }

  async updatePatroller(patrollerId, patrollerData) {
    try {
      await updateDoc(doc(db, this.collections.patrollers, patrollerId), {
        ...patrollerData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating patroller:', error);
      throw error;
    }
  }

  async getPatroller(patrollerId) {
    try {
      const patrollerDoc = await getDoc(doc(db, this.collections.patrollers, patrollerId));
      return patrollerDoc.exists() ? patrollerDoc.data() : null;
    } catch (error) {
      console.error('Error getting patroller:', error);
      throw error;
    }
  }

  async getAllPatrollers() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.patrollers));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all patrollers:', error);
      throw error;
    }
  }

  // Incidents Collection Operations
  async createIncident(incidentData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.incidents), {
        ...incidentData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  async updateIncident(incidentId, incidentData) {
    try {
      await updateDoc(doc(db, this.collections.incidents, incidentId), {
        ...incidentData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  }

  async getIncident(incidentId) {
    try {
      const incidentDoc = await getDoc(doc(db, this.collections.incidents, incidentId));
      return incidentDoc.exists() ? incidentDoc.data() : null;
    } catch (error) {
      console.error('Error getting incident:', error);
      throw error;
    }
  }

  async getIncidentsByStatus(status) {
    try {
      const q = query(
        collection(db, this.collections.incidents),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting incidents by status:', error);
      throw error;
    }
  }

  // Reports Collection Operations
  async createReport(reportData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.reports), {
        ...reportData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async updateReport(reportId, reportData) {
    try {
      await updateDoc(doc(db, this.collections.reports, reportId), {
        ...reportData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }

  async getReport(reportId) {
    try {
      const reportDoc = await getDoc(doc(db, this.collections.reports, reportId));
      return reportDoc.exists() ? reportDoc.data() : null;
    } catch (error) {
      console.error('Error getting report:', error);
      throw error;
    }
  }

  async getReportsByDateRange(startDate, endDate) {
    try {
      const q = query(
        collection(db, this.collections.reports),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting reports by date range:', error);
      throw error;
    }
  }

  // Locations Collection Operations
  async createLocation(locationData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.locations), {
        ...locationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  async updateLocation(locationId, locationData) {
    try {
      await updateDoc(doc(db, this.collections.locations, locationId), {
        ...locationData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async getLocation(locationId) {
    try {
      const locationDoc = await getDoc(doc(db, this.collections.locations, locationId));
      return locationDoc.exists() ? locationDoc.data() : null;
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  async getAllLocations() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.locations));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all locations:', error);
      throw error;
    }
  }

  // Schedules Collection Operations
  async createSchedule(scheduleData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.schedules), {
        ...scheduleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async updateSchedule(scheduleId, scheduleData) {
    try {
      await updateDoc(doc(db, this.collections.schedules, scheduleId), {
        ...scheduleData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  async getSchedule(scheduleId) {
    try {
      const scheduleDoc = await getDoc(doc(db, this.collections.schedules, scheduleId));
      return scheduleDoc.exists() ? scheduleDoc.data() : null;
    } catch (error) {
      console.error('Error getting schedule:', error);
      throw error;
    }
  }

  async getSchedulesByPatroller(patrollerId) {
    try {
      const q = query(
        collection(db, this.collections.schedules),
        where('patrollerId', '==', patrollerId),
        orderBy('startTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting schedules by patroller:', error);
      throw error;
    }
  }
}

export default new FirestoreService(); 