import React, { createContext, useContext, useState, useEffect } from 'react';

const IPatrollerContext = createContext();

export const useIPatrollerData = () => {
  const context = useContext(IPatrollerContext);
  if (!context) {
    throw new Error('useIPatrollerData must be used within an IPatrollerProvider');
  }
  return context;
};

export const IPatrollerProvider = ({ children }) => {
  const [allData, setAllDataState] = useState(() => {
    // Load data from localStorage on initialization
    const savedData = localStorage.getItem('ipatrollerData');
    return savedData ? JSON.parse(savedData) : {};
  });
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [loading, setLoading] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);

  // Custom setAllData function that also saves to localStorage
  const setAllData = (newData) => {
    setAllDataState(newData);
    // Save to localStorage for persistence
    localStorage.setItem('ipatrollerData', JSON.stringify(newData));
  };

  // Get date headers for a month
  const getDateHeaders = (monthValue) => {
    const [year, month] = monthValue.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const dateHeaders = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateHeaders.push(d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }));
    }
    return dateHeaders;
  };

  // Get empty data structure for a month
  const getEmptyData = (monthValue) => {
    const days = getDateHeaders(monthValue).length;
    return {
      'ABUCAY': Array(days).fill(''),
      'ORANI': Array(days).fill(''),
      'SAMAL': Array(days).fill(''),
      'HERMOSA': Array(days).fill(''),
      'BALANGA': Array(days).fill(''),
      'PILAR': Array(days).fill(''),
      'ORION': Array(days).fill(''),
      'LIMAY': Array(days).fill(''),
      'BAGAC': Array(days).fill(''),
      'DINALUPIHAN': Array(days).fill(''),
      'MARIVELES': Array(days).fill(''),
      'MORONG': Array(days).fill(''),
    };
  };

  // Load data for a specific month from localStorage
  const loadMonthData = (month) => {
    return allData[month] || getEmptyData(month);
  };

  // Load all available months from localStorage
  const loadAllMonths = () => {
    return Object.keys(allData).sort();
  };

  // Initialize data
  useEffect(() => {
    const initializeData = () => {
      try {
        // Load available months from localStorage
        const months = loadAllMonths();
        setAvailableMonths(months);
        
        // If no months available, add current month
        if (months.length === 0) {
          setAvailableMonths([selectedMonth]);
        }
        
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [allData, selectedMonth]);

  // Update data for a specific month
  const updateMonthData = (month, data) => {
    setAllDataState(prev => {
      const updated = {
        ...prev,
        [month]: data
      };
      // Save to localStorage for persistence
      localStorage.setItem('ipatrollerData', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear data for a specific month
  const clearMonthData = (month) => {
    setAllDataState(prev => {
      const updated = { ...prev };
      delete updated[month];
      // Save to localStorage for persistence
      localStorage.setItem('ipatrollerData', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear all data
  const clearAllData = () => {
    setAllDataState({});
    localStorage.removeItem('ipatrollerData');
  };

  // Update multiple months at once (for Excel import)
  const updateMultipleMonths = (monthsData) => {
    setAllDataState(prev => {
      const updated = {
        ...prev,
        ...monthsData
      };
      // Save to localStorage for persistence
      localStorage.setItem('ipatrollerData', JSON.stringify(updated));
      return updated;
    });
  };

  // Get current month data
  const getCurrentMonthData = () => {
    return allData[selectedMonth] || getEmptyData(selectedMonth);
  };

  // Get status data (active/inactive based on counts)
  const getStatusData = () => {
    const currentData = getCurrentMonthData();
    const statusData = {};
    
    Object.keys(currentData).forEach(municipality => {
      const counts = currentData[municipality];
      const totalCount = counts.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
      statusData[municipality] = totalCount >= 5 ? 'Active' : 'Inactive';
    });
    
    return statusData;
  };

  // Get summary statistics
  const getSummaryStats = () => {
    const currentData = getCurrentMonthData();
    const statusData = getStatusData();
    
    const totalMunicipalities = Object.keys(currentData).length;
    const activeMunicipalities = Object.values(statusData).filter(status => status === 'Active').length;
    const inactiveMunicipalities = totalMunicipalities - activeMunicipalities;
    
    const totalPatrollers = Object.values(currentData).reduce((sum, counts) => {
      return sum + counts.reduce((daySum, count) => daySum + (parseInt(count) || 0), 0);
    }, 0);
    
    return {
      totalMunicipalities,
      activeMunicipalities,
      inactiveMunicipalities,
      totalPatrollers,
      activePercentage: totalMunicipalities > 0 ? (activeMunicipalities / totalMunicipalities) * 100 : 0
    };
  };

  const value = {
    allData,
    setAllData,
    selectedMonth,
    setSelectedMonth,
    loading,
    availableMonths,
    getDateHeaders,
    getEmptyData,
    loadMonthData,
    updateMonthData,
    updateMultipleMonths,
    clearMonthData,
    clearAllData,
    getCurrentMonthData,
    getStatusData,
    getSummaryStats
  };

  return (
    <IPatrollerContext.Provider value={value}>
      {children}
    </IPatrollerContext.Provider>
  );
}; 