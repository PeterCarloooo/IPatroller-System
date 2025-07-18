import { db } from '../api/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// District data
const districts = {
  '1ST DISTRICT': ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA'],
  '2ND DISTRICT': ['BALANGA', 'PILAR', 'ORION', 'LIMAY'],
  '3RD DISTRICT': ['BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG']
};

class PatrollerService {
  constructor() {
    this.collectionName = 'patroller_reports';
  }

  // Format date to YYYY-MM-DD for consistent storage
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Initialize empty report data with default structure
  initializeEmptyReport() {
    const report = {};
    Object.entries(districts).forEach(([district, municipalities]) => {
      report[district] = {};
      municipalities.forEach(municipality => {
        report[district][municipality] = null;
      });
    });
    return report;
  }

  // Create or update daily count for a municipality
  async updateDailyCount(date, district, municipality, count) {
    try {
      const formattedDate = this.formatDate(new Date(date));
      const reportRef = doc(db, this.collectionName, formattedDate);
      
      // Get existing data for the date
      const reportDoc = await getDoc(reportRef);
      let reportData = reportDoc.exists() ? reportDoc.data() : this.initializeEmptyReport();

      // Update the count for the specific district and municipality
      reportData[district] = reportData[district] || {};
      reportData[district][municipality] = parseInt(count) || null;

      // Save to Firestore
      await setDoc(reportRef, reportData, { merge: true });

      return {
        date: formattedDate,
        district,
        municipality,
        count: parseInt(count) || null
      };
    } catch (error) {
      console.error('Error updating daily count:', error);
      throw new Error('Failed to update daily count');
    }
  }

  // Get reports for a specific month
  async getMonthlyReports(year, month) {
    try {
      // Calculate start and end dates for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);

      // Query Firestore for the date range
      const reportsRef = collection(db, this.collectionName);
      const q = query(
        reportsRef,
        where('__name__', '>=', formattedStartDate),
        where('__name__', '<=', formattedEndDate)
      );

      const querySnapshot = await getDocs(q);
      const reports = {};

      // Generate all dates in the month with initialized data
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = this.formatDate(currentDate);
        reports[dateKey] = this.initializeEmptyReport();
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Overlay actual data from Firestore
      querySnapshot.forEach((doc) => {
        reports[doc.id] = {
          ...reports[doc.id],
          ...doc.data()
        };
      });

      return reports;
    } catch (error) {
      console.error('Error getting monthly reports:', error);
      throw new Error('Failed to fetch monthly reports');
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
      Object.keys(districts).forEach(district => {
        districtStats[district] = {
          incidents: 0,
          activePatrollers: 0,
          inactivePatrollers: 0
        };
      });

      // Calculate statistics from all dates
      dates.forEach(date => {
        const reportData = reports[date];
        Object.entries(districts).forEach(([district, municipalities]) => {
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

  // Get report for a specific date
  async getDailyReport(date) {
    try {
      const formattedDate = this.formatDate(new Date(date));
      const reportRef = doc(db, this.collectionName, formattedDate);
      const reportDoc = await getDoc(reportRef);

      if (reportDoc.exists()) {
        return reportDoc.data();
      }

      return null;
    } catch (error) {
      console.error('Error getting daily report:', error);
      throw new Error('Failed to fetch daily report');
    }
  }

  // Batch update multiple counts
  async batchUpdateCounts(updates) {
    try {
      const groupedByDate = {};

      // Group updates by date
      updates.forEach(({ date, district, municipality, count }) => {
        const formattedDate = this.formatDate(new Date(date));
        groupedByDate[formattedDate] = groupedByDate[formattedDate] || {};
        groupedByDate[formattedDate][district] = groupedByDate[formattedDate][district] || {};
        groupedByDate[formattedDate][district][municipality] = parseInt(count) || null;
      });

      // Update each date's document
      for (const [date, data] of Object.entries(groupedByDate)) {
        const reportRef = doc(db, this.collectionName, date);
        const reportDoc = await getDoc(reportRef);
        
        let reportData = reportDoc.exists() ? reportDoc.data() : this.initializeEmptyReport();
        
        // Merge new data with existing data
        Object.entries(data).forEach(([district, municipalities]) => {
          reportData[district] = reportData[district] || {};
          Object.assign(reportData[district], municipalities);
        });
        
        await setDoc(reportRef, reportData, { merge: true });
      }

      return true;
    } catch (error) {
      console.error('Error in batch update:', error);
      throw new Error('Failed to update multiple counts');
    }
  }
}

export default new PatrollerService(); 