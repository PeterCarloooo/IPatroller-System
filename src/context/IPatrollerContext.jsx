import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  initializeRealtimeDB, 
  saveIPatrollerData, 
  loadAllIPatrollerData, 
  setupRealtimeListener,
  removeRealtimeListener,
  updateSystemStatus
} from '../firebase/realtimeDB';

const IPatrollerContext = createContext();

export const useIPatrollerData = () => {
  const context = useContext(IPatrollerContext);
  if (!context) {
    throw new Error('useIPatrollerData must be used within an IPatrollerProvider');
  }
  return context;
};

export const IPatrollerProvider = ({ children }) => {
  // Only show data for imported months, not all 12 months
  const getHardcodedData = () => {
    // Return empty object - no hardcoded data
    // Data will only come from imported Excel files
    return {};
  };

  const [allData, setAllDataState] = useState(() => {
    // Load from localStorage on initialization
    const savedData = localStorage.getItem('ipatrollerData');
    console.log('🔄 Initializing IPatrollerContext...');
    console.log('📦 Raw localStorage data:', savedData);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('📊 Loaded data from localStorage on init:', Object.keys(parsedData));
        console.log('📊 Data keys found:', Object.keys(parsedData));
        
        // Validate that we have actual data (not just empty arrays)
        const validData = {};
        Object.keys(parsedData).forEach(month => {
          const monthData = parsedData[month];
          if (monthData && typeof monthData === 'object') {
            // Check if this month has any actual data
            const hasData = Object.values(monthData).some(municipalityData => 
              Array.isArray(municipalityData) && municipalityData.some(count => 
                count !== '' && count !== null && count !== undefined && parseInt(count) > 0
              )
            );
            if (hasData) {
              validData[month] = monthData;
              console.log(`✅ Valid data found for month: ${month}`);
            } else {
              console.log(`⚠️ No valid data for month: ${month}`);
            }
          }
        });
        
        console.log('📊 Final valid data keys:', Object.keys(validData));
        return validData;
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        return {};
      }
    } else {
      console.log('📝 No saved data found in localStorage');
    }
    return {};
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Load selected month from localStorage on initialization
    const savedMonth = localStorage.getItem('selectedMonth');
    return savedMonth || '';
  });
  const [loading, setLoading] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);

  // Custom setAllData function that also saves to localStorage
  const setAllData = (newData) => {
    setAllDataState(newData);
    // Save to localStorage for persistence
    localStorage.setItem('ipatrollerData', JSON.stringify(newData));
  };

  // Custom setSelectedMonth function that also saves to localStorage
  const setSelectedMonthPersistent = (month) => {
    setSelectedMonth(month);
    // Save to localStorage for persistence
    localStorage.setItem('selectedMonth', month);
  };

  // Get date headers for a month
  const getDateHeaders = (monthValue) => {
    try {
      if (!monthValue || typeof monthValue !== 'string') {
        console.warn('Invalid monthValue provided to getDateHeaders:', monthValue);
        return [];
      }
      
      const [year, month] = monthValue.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || year < 2000 || year > 2100 || month < 1 || month > 12) {
        console.warn('Invalid year or month in getDateHeaders:', { year, month });
        return [];
      }
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const dateHeaders = [];
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dateHeaders.push(d.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        }));
      }
      
      console.log(`Generated ${dateHeaders.length} date headers for ${monthValue}`);
      return dateHeaders;
    } catch (error) {
      console.error('Error in getDateHeaders:', error);
      return [];
    }
  };

  // Get empty data structure for a month
  const getEmptyData = (monthValue) => {
    try {
      console.log('getEmptyData called with:', monthValue);
      
      if (!monthValue || typeof monthValue !== 'string') {
        console.warn('Invalid monthValue provided to getEmptyData:', monthValue);
        return {
          'ABUCAY': [], 'ORANI': [], 'SAMAL': [], 'HERMOSA': [], 'BALANGA': [],
          'PILAR': [], 'ORION': [], 'LIMAY': [], 'BAGAC': [], 'DINALUPIHAN': [],
          'MARIVELES': [], 'MORONG': [],
        };
      }
      
      const [year, month] = monthValue.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || year < 2000 || year > 2100 || month < 1 || month > 12) {
        console.warn('Invalid year or month in getEmptyData:', { year, month });
        return {
          'ABUCAY': [], 'ORANI': [], 'SAMAL': [], 'HERMOSA': [], 'BALANGA': [],
          'PILAR': [], 'ORION': [], 'LIMAY': [], 'BAGAC': [], 'DINALUPIHAN': [],
          'MARIVELES': [], 'MORONG': [],
        };
      }
      
      const daysInMonth = new Date(year, month, 0).getDate();
      console.log(`Creating empty data structure with ${daysInMonth} days for ${monthValue}`);
      
      return {
        'ABUCAY': new Array(daysInMonth).fill(''),
        'ORANI': new Array(daysInMonth).fill(''),
        'SAMAL': new Array(daysInMonth).fill(''),
        'HERMOSA': new Array(daysInMonth).fill(''),
        'BALANGA': new Array(daysInMonth).fill(''),
        'PILAR': new Array(daysInMonth).fill(''),
        'ORION': new Array(daysInMonth).fill(''),
        'LIMAY': new Array(daysInMonth).fill(''),
        'BAGAC': new Array(daysInMonth).fill(''),
        'DINALUPIHAN': new Array(daysInMonth).fill(''),
        'MARIVELES': new Array(daysInMonth).fill(''),
        'MORONG': new Array(daysInMonth).fill(''),
      };
    } catch (error) {
      console.error('Error in getEmptyData:', error);
      return {
        'ABUCAY': [], 'ORANI': [], 'SAMAL': [], 'HERMOSA': [], 'BALANGA': [],
        'PILAR': [], 'ORION': [], 'LIMAY': [], 'BAGAC': [], 'DINALUPIHAN': [],
        'MARIVELES': [], 'MORONG': [],
      };
    }
  };

  // Load data for a specific month from localStorage
  const loadMonthData = (month) => {
    if (allData[month]) {
      console.log(`📊 Loading data for ${month}:`, allData[month]);
      return allData[month];
    }
    
    console.log(`📝 No data found for ${month}, returning empty structure`);
    // If no data exists, return empty data structure
    return getEmptyData(month);
  };

  // Load all available months from localStorage
  const loadAllMonths = () => {
    // Return empty array if no data exists
    if (Object.keys(allData).length === 0) {
      return [];
    }
    
    // Only return months that have actual imported data (not empty)
    return Object.keys(allData).filter(month => {
      const monthData = allData[month];
      // Check if month has any non-empty data with actual values
      return monthData && Object.values(monthData).some(municipalityData => 
        municipalityData.some(count => {
          const numCount = parseInt(count);
          return count !== '' && count !== null && count !== undefined && !isNaN(numCount) && numCount > 0;
        })
      );
    }).sort();
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🔄 Initializing with localStorage only...');
        
        // Load data from localStorage
        const localStorageData = localStorage.getItem('ipatrollerData');
        let availableMonths = [];
        
        if (localStorageData) {
          try {
            const parsedData = JSON.parse(localStorageData);
            console.log('📊 Loaded data from localStorage:', Object.keys(parsedData));
            
            // Set the data to state so it's available throughout the app
            setAllDataState(parsedData);
            availableMonths = Object.keys(parsedData).sort();
            
            // Auto-select first month if no month is currently selected
            if (!selectedMonth && availableMonths.length > 0) {
              const firstMonth = availableMonths[0];
              setSelectedMonthPersistent(firstMonth);
              console.log(`📅 Auto-selected first month: ${firstMonth}`);
            }
            
            console.log('✅ Data loaded and set to state successfully');
          } catch (error) {
            console.warn('⚠️ Error parsing localStorage data:', error);
          }
        } else {
          console.log('📝 No data found in localStorage');
        }
        
        setAvailableMonths(availableMonths);
        console.log('📊 Available months:', availableMonths);
        
      } catch (error) {
        console.error('❌ Error in initializeData:', error);
        setAvailableMonths([]);
      }
    };

    initializeData();
  }, []); // Only run once on initialization

  // Debug effect to log data changes
  useEffect(() => {
    console.log('🔄 allData changed:', Object.keys(allData));
    console.log('📊 Current localStorage data:', localStorage.getItem('ipatrollerData'));
  }, [allData]);

  // TEMPORARILY DISABLE REALTIME LISTENER
  useEffect(() => {
    console.log('🔄 Realtime listener temporarily disabled...');
    console.log('🔄 To enable, update Firebase security rules');
    // try {
    //   const unsubscribe = setupRealtimeListener((newData) => {
    //     console.log('🔄 Realtime update received in context:', Object.keys(newData));
    //     setAllDataState(newData);
    //     localStorage.setItem('ipatrollerData', JSON.stringify(newData));
    //   });

    //   // Cleanup listener on unmount
    //   return () => {
    //     if (unsubscribe) {
    //       removeRealtimeListener(unsubscribe);
    //     }
    //   };
    // } catch (error) {
    //   console.warn('⚠️ Realtime listener setup failed:', error.message);
    //   console.log('🔄 Continuing without realtime updates...');
    //   return () => {}; // Return empty cleanup function
    // }
    return () => {}; // Return empty cleanup function
  }, []);

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
    setSelectedMonthPersistent('');
    localStorage.removeItem('ipatrollerData');
    localStorage.removeItem('selectedMonth');
  };

  // Update multiple months at once (for Excel import) - Optimized for speed
  const updateMultipleMonths = async (monthsData) => {
    console.log('🔄 Updating multiple months with data:', Object.keys(monthsData));
    
    // Skip Firebase for faster import - use localStorage only
    console.log('💾 Saving to localStorage only for faster performance...');
    
    setAllDataState(prev => {
      const updated = {
        ...prev,
        ...monthsData
      };
      
      // Save to localStorage for persistence
      localStorage.setItem('ipatrollerData', JSON.stringify(updated));
      console.log('✅ Data saved to localStorage:', Object.keys(updated));
      
      // Auto-select first month if no month is currently selected
      if (!selectedMonth && Object.keys(monthsData).length > 0) {
        const firstMonth = Object.keys(monthsData).sort()[0];
        setSelectedMonthPersistent(firstMonth);
        console.log(`📅 Auto-selected first month: ${firstMonth}`);
      }
      
      return updated;
    });
  };

  // Get current month data
  const getCurrentMonthData = () => {
    // Only return data if Excel has been imported
    if (allData[selectedMonth]) {
      console.log(`📊 Getting current month data for ${selectedMonth}:`, allData[selectedMonth]);
      return allData[selectedMonth];
    }
    
    console.log(`📝 No data found for current month ${selectedMonth}, returning empty structure`);
    // Return empty data structure if no Excel imported
    return getEmptyData(selectedMonth);
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
    setSelectedMonth: setSelectedMonthPersistent,
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