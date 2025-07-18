import { db } from '../api/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

// Define fixed data structure
const INITIAL_DATA = {
  '1ST DISTRICT': {
    'BINMALEY': null,
    'LINGAYEN': null,
    'AGUILAR': null,
    'BUGALLON': null,
    'LABRADOR': null,
    'SUAL': null
  },
  '2ND DISTRICT': {
    'DAGUPAN': null,
    'CALASIAO': null,
    'BINALONAN': null,
    'MANAOAG': null,
    'MANGALDAN': null,
    'SAN FABIAN': null,
    'SAN JACINTO': null
  },
  '3RD DISTRICT': {
    'ROSALES': null,
    'VILLASIS': null,
    'ASINGAN': null,
    'STA. BARBARA': null,
    'MALASIQUI': null,
    'BAYAMBANG': null
  }
};

class PatrollerService {
  constructor() {
    this.reportsCollection = 'reports';
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

  async getMonthlyReports(year, month) {
    try {
      const dates = this.generateMonthDates(year, month);
      const reports = {};

      // Initialize data structure for all days in the month with fixed order
      dates.forEach(date => {
        reports[date] = JSON.parse(JSON.stringify(INITIAL_DATA));
      });

      // Get existing data from Firestore
      const reportsRef = collection(db, this.reportsCollection);
      const { startDate, endDate } = this.getMonthDateRange(year, month);

      const q = query(
        reportsRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.date && 
          data.district && 
          data.municipality && 
          data.count !== undefined &&
          this.isDateInMonth(data.date, year, month) &&
          INITIAL_DATA[data.district]?.[data.municipality] !== undefined
        ) {
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
      Object.keys(INITIAL_DATA).forEach(district => {
        districtStats[district] = {
          incidents: 0,
          activePatrollers: 0,
          inactivePatrollers: 0
        };
      });

      // Calculate statistics from all dates
      dates.forEach(date => {
        const reportData = reports[date];
        Object.entries(INITIAL_DATA).forEach(([district, municipalities]) => {
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
      const reportRef = doc(db, this.reportsCollection, `${formattedDate}_${district}_${municipality}`.replace(/\s+/g, '_'));
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

  async batchUpdateCounts(updates) {
    try {
      const batch = [];
      
      for (const update of updates) {
        const { date, district, municipality, count } = update;
        
        // Validate that the date is properly formatted and municipality exists
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error('Invalid date format. Expected YYYY-MM-DD');
        }

        if (!INITIAL_DATA[district]?.[municipality]) {
          throw new Error(`Invalid district or municipality: ${district} - ${municipality}`);
        }

        const docId = `${date}_${district}_${municipality}`.replace(/\s+/g, '_');
        const docRef = doc(db, this.reportsCollection, docId);
        
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          batch.push(updateDoc(docRef, {
            count,
            lastUpdated: new Date().toISOString()
          }));
        } else {
          batch.push(setDoc(docRef, {
            date,
            district,
            municipality,
            count,
            lastUpdated: new Date().toISOString()
          }));
        }
      }
      
      await Promise.all(batch);
      return true;
    } catch (error) {
      console.error('Error updating counts:', error);
      throw new Error('Failed to update reports');
    }
  }
}

export default new PatrollerService(); 