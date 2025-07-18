import { db } from '../api/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

// District data
const districts = {
  '1ST DISTRICT': ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA'],
  '2ND DISTRICT': ['BALANGA', 'PILAR', 'ORION', 'LIMAY'],
  '3RD DISTRICT': ['BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG']
};

class PatrollerService {
  constructor() {
    this.reportsCollection = 'reports';
  }

  // Helper function to format date to YYYY-MM-DD
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Helper function to get start and end dates for a month
  getMonthDateRange(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)
    };
  }

  // Helper function to generate dates array for a month
  generateMonthDates(year, month) {
    const { startDate, endDate } = this.getMonthDateRange(year, month);
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      dates.push(this.formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
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
      const reportRef = doc(db, this.reportsCollection, `${formattedDate}_${district}_${municipality}`.replace(/\s+/g, '_'));
      
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

  async getMonthlyReports(year, month) {
    try {
      const dates = this.generateMonthDates(year, month);
      const reports = {};

      // Initialize data structure for all days in the month
      dates.forEach(date => {
        reports[date] = {
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
        if (data.date && data.district && data.municipality && data.count !== undefined) {
          // Only include data if the date is within our generated dates
          if (dates.includes(data.date)) {
            reports[data.date][data.district][data.municipality] = data.count;
          }
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
        
        // Validate that the date is properly formatted
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error('Invalid date format. Expected YYYY-MM-DD');
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