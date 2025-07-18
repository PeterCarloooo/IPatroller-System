import { db } from '../api/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { auth } from '../api/firebase';

// Define fixed district and municipality structure
const DISTRICTS = {
  '1ST DISTRICT': ['ABUCAY', 'HERMOSA', 'ORANI', 'SAMAL'],
  '2ND DISTRICT': ['BALANGA', 'ORION', 'LIMAY', 'PILAR'],
  '3RD DISTRICT': ['BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG']
};

// Initialize empty data structure
const createInitialData = () => {
  const data = {};
  Object.entries(DISTRICTS).forEach(([district, municipalities]) => {
    data[district] = {};
    municipalities.forEach(municipality => {
      data[district][municipality] = null;
    });
  });
  return data;
};

class PatrollerService {
  constructor() {
    this.reportsCollection = 'reports';
    this.patrollerLogsCollection = 'patroller_logs';
  }

  // Helper function to format date to YYYY-MM-DD with UTC handling
  formatDate(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
    return d.toISOString().split('T')[0];
  }

  // Helper function to check if a date is within a specific month
  isDateInMonth(dateStr, year, month) {
    const date = new Date(dateStr + 'T12:00:00Z');
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1;
  }

  // Helper function to get start and end dates for a month
  getMonthDateRange(year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 12, 0, 0));
    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)
    };
  }

  // Helper function to generate dates array for a month
  generateMonthDates(year, month) {
    const { startDate, endDate } = this.getMonthDateRange(year, month);
    const dates = [];
    const currentDate = new Date(startDate + 'T12:00:00Z');
    const lastDate = new Date(endDate + 'T12:00:00Z');

    while (currentDate <= lastDate) {
      const dateStr = this.formatDate(currentDate);
      if (this.isDateInMonth(dateStr, year, month)) {
        dates.push(dateStr);
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
  }

  // Helper function to validate count value
  validateCount(count) {
    if (count === null) return true;
    if (typeof count !== 'number') return false;
    if (count < 0 || count > 150) return false;
    return Number.isInteger(count);
  }

  // Helper function to create report metadata
  createReportMetadata(date, district, municipality) {
    const user = auth.currentUser;
    return {
      createdBy: user?.uid || 'system',
      createdByEmail: user?.email || 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      year: new Date(date).getUTCFullYear(),
      month: new Date(date).getUTCMonth() + 1,
      status: 'active',
      version: 1
    };
  }

  async getMonthlyReports(year, month) {
    try {
      const dates = this.generateMonthDates(year, month);
      const reports = {};

      // Initialize data structure for all days in the month
      dates.forEach(date => {
        reports[date] = createInitialData();
      });

      // Get existing data from Firestore
      const reportsRef = collection(db, this.reportsCollection);
      const { startDate, endDate } = this.getMonthDateRange(year, month);

      const q = query(
        reportsRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.date && 
          data.district && 
          data.municipality && 
          data.count !== undefined &&
          DISTRICTS[data.district]?.includes(data.municipality)
        ) {
          if (!reports[data.date]) {
            reports[data.date] = createInitialData();
          }
          reports[data.date][data.district][data.municipality] = data.count;
        }
      });

      return reports;
    } catch (error) {
      console.error('Error getting monthly reports:', error);
      throw new Error('Failed to fetch reports');
    }
  }

  async getPatrollerStats(year, month) {
    try {
      const reports = await this.getMonthlyReports(year, month);
      const dates = Object.keys(reports).sort();

      // Initialize counters
      let totalIncidents = 0;
      let activePatrollers = 0;
      let inactivePatrollers = 0;
      let districtStats = {};

      // Initialize district stats
      Object.keys(DISTRICTS).forEach(district => {
        districtStats[district] = {
          incidents: 0,
          activePatrollers: 0,
          inactivePatrollers: 0
        };
      });

      // Calculate statistics from all dates
      dates.forEach(date => {
        const reportData = reports[date];
        Object.entries(DISTRICTS).forEach(([district, municipalities]) => {
          municipalities.forEach(municipality => {
            const value = reportData?.[district]?.[municipality];
            if (value !== null && value !== undefined) {
              // Count incidents
              totalIncidents += value;
              districtStats[district].incidents += value;

              // Count active/inactive patrollers
              if (value >= 5) {
                activePatrollers++;
                districtStats[district].activePatrollers++;
              } else {
                inactivePatrollers++;
                districtStats[district].inactivePatrollers++;
              }
            }
          });
        });
      });

      const totalPatrollers = activePatrollers + inactivePatrollers;
      const activityRate = totalPatrollers > 0 
        ? ((activePatrollers / totalPatrollers) * 100).toFixed(1) 
        : '0.0';

      return {
        overview: {
          totalIncidents,
          activePatrollers,
          inactivePatrollers,
          totalPatrollers,
          activityRate
        },
        districtStats,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getPatrollerStats:', error);
      throw new Error('Failed to fetch patroller statistics');
    }
  }

  async getDailyReport(date, district, municipality) {
    try {
      const formattedDate = this.formatDate(new Date(date));
      const reportRef = doc(db, this.reportsCollection, `${formattedDate}_${district}_${municipality}`.replace(/\s+/g, '_'));
      const reportDoc = await getDoc(reportRef);

      if (reportDoc.exists()) {
        const data = reportDoc.data();
        if (data.status === 'active') {
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting daily report:', error);
      throw new Error('Failed to fetch daily report');
    }
  }

  async batchUpdateCounts(updates) {
    try {
      // Create a new batch
      const batch = writeBatch(db);
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User must be authenticated to update reports');
      }

      for (const update of updates) {
        const { date, district, municipality, count } = update;
        
        // Validate inputs
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error('Invalid date format. Expected YYYY-MM-DD');
        }

        if (!DISTRICTS[district]?.includes(municipality)) {
          throw new Error(`Invalid district or municipality: ${district} - ${municipality}`);
        }

        if (!this.validateCount(count)) {
          throw new Error(`Invalid count value for ${district} - ${municipality}: ${count}`);
        }

        const docId = `${date}_${district}_${municipality}`.replace(/\s+/g, '_');
        const docRef = doc(db, this.reportsCollection, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Update existing document
          batch.update(docRef, {
            count,
            updatedAt: serverTimestamp(),
            updatedBy: user.uid,
            updatedByEmail: user.email,
            version: (docSnap.data().version || 1) + 1
          });

          // Log the update
          const logRef = doc(collection(db, this.patrollerLogsCollection));
          batch.set(logRef, {
            reportId: docId,
            date,
            district,
            municipality,
            oldCount: docSnap.data().count,
            newCount: count,
            updatedAt: serverTimestamp(),
            updatedBy: user.uid,
            updatedByEmail: user.email,
            action: 'update'
          });
        } else {
          // Create new document
          batch.set(docRef, {
            date,
            district,
            municipality,
            count,
            ...this.createReportMetadata(date, district, municipality)
          });

          // Log the creation
          const logRef = doc(collection(db, this.patrollerLogsCollection));
          batch.set(logRef, {
            reportId: docId,
            date,
            district,
            municipality,
            newCount: count,
            createdAt: serverTimestamp(),
            createdBy: user.uid,
            createdByEmail: user.email,
            action: 'create'
          });
        }
      }
      
      // Commit the batch
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error updating counts:', error);
      throw new Error(error.message || 'Failed to update reports');
    }
  }

  // New method to get update history for a report
  async getReportHistory(date, district, municipality) {
    try {
      const docId = `${date}_${district}_${municipality}`.replace(/\s+/g, '_');
      const logsRef = collection(db, this.patrollerLogsCollection);
      const q = query(
        logsRef,
        where('reportId', '==', docId),
        where('date', '==', date)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      }));
    } catch (error) {
      console.error('Error getting report history:', error);
      throw new Error('Failed to fetch report history');
    }
  }
}

export default new PatrollerService(); 