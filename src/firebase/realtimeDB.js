import { ref, set, get, push, update, remove, onValue, off, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from './config';

// Realtime Database Service for IPatroller System

// Initialize realtime database structure
export const initializeRealtimeDB = async () => {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(dbRef);
    
    if (!snapshot.exists()) {
      // Create initial database structure
      const initialStructure = {
        ipatroller: {
          data: {},
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: '1.0.0',
            totalRecords: 0
          }
        },
        users: {
          online: {},
          activity: {}
        },
        system: {
          status: 'active',
          maintenance: false,
          lastSync: new Date().toISOString()
        }
      };
      
      await set(dbRef, initialStructure);
      console.log('✅ Realtime Database initialized with structure');
    } else {
      console.log('✅ Realtime Database already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing Realtime Database:', error);
    // Don't throw the error, just log it and let the caller handle it
    throw error;
  }
};

// Save IPatroller data to realtime database
export const saveIPatrollerData = async (monthData, month) => {
  try {
    const dataRef = ref(rtdb, `ipatroller/data/${month}`);
    
    // Prepare data for realtime database
    const realtimeData = {
      month: month,
      data: monthData,
      lastUpdated: new Date().toISOString(),
      recordCount: Object.keys(monthData).length
    };
    
    await set(dataRef, realtimeData);
    console.log(`✅ Saved ${month} data to Realtime Database`);
    
    // Update metadata
    await updateMetadata();
    
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${month} to Realtime Database:`, error);
    return false;
  }
};

// Load IPatroller data from realtime database
export const loadIPatrollerData = async (month) => {
  try {
    const dataRef = ref(rtdb, `ipatroller/data/${month}`);
    const snapshot = await get(dataRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(`✅ Loaded ${month} data from Realtime Database`);
      return data.data; // Return the actual month data
    } else {
      console.log(`📝 No data found for ${month} in Realtime Database`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error loading ${month} from Realtime Database:`, error);
    return null;
  }
};

// Load all IPatroller data from realtime database
export const loadAllIPatrollerData = async () => {
  try {
    const dataRef = ref(rtdb, 'ipatroller/data');
    const snapshot = await get(dataRef);
    
    if (snapshot.exists()) {
      const allData = {};
      const data = snapshot.val();
      
      Object.keys(data).forEach(month => {
        if (data[month] && data[month].data) {
          allData[month] = data[month].data;
        }
      });
      
      console.log('✅ Loaded all data from Realtime Database:', Object.keys(allData));
      return allData;
    } else {
      console.log('📝 No data found in Realtime Database');
      return {};
    }
  } catch (error) {
    console.error('❌ Error loading all data from Realtime Database:', error);
    return {};
  }
};

// Update metadata
export const updateMetadata = async () => {
  try {
    const metadataRef = ref(rtdb, 'ipatroller/metadata');
    const dataRef = ref(rtdb, 'ipatroller/data');
    const snapshot = await get(dataRef);
    
    let totalRecords = 0;
    if (snapshot.exists()) {
      totalRecords = Object.keys(snapshot.val()).length;
    }
    
    const metadata = {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      totalRecords: totalRecords
    };
    
    await set(metadataRef, metadata);
    console.log('✅ Updated Realtime Database metadata');
  } catch (error) {
    console.error('❌ Error updating metadata:', error);
  }
};

// Set up realtime listener for data changes
export const setupRealtimeListener = (callback) => {
  try {
    const dataRef = ref(rtdb, 'ipatroller/data');
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const processedData = {};
        
        Object.keys(data).forEach(month => {
          if (data[month] && data[month].data) {
            processedData[month] = data[month].data;
          }
        });
        
        console.log('🔄 Realtime update received:', Object.keys(processedData));
        callback(processedData);
      } else {
        console.log('📝 No data in Realtime Database');
        callback({});
      }
    }, (error) => {
      console.error('❌ Realtime listener error:', error);
      // If permission denied, call callback with empty data
      if (error.code === 'PERMISSION_DENIED') {
        console.warn('⚠️ Permission denied for Realtime Database, using empty data');
        callback({});
      }
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up realtime listener:', error);
    // Return a dummy unsubscribe function that does nothing
    return () => {};
  }
};

// Remove realtime listener
export const removeRealtimeListener = (unsubscribe) => {
  if (unsubscribe) {
    off(ref(rtdb, 'ipatroller/data'));
    console.log('✅ Removed realtime listener');
  }
};

// Update user online status
export const updateUserStatus = async (userId, status) => {
  try {
    const userRef = ref(rtdb, `users/online/${userId}`);
    await set(userRef, {
      status: status,
      lastUpdated: new Date().toISOString(),
      userId: userId
    });
    console.log(`✅ Updated user ${userId} status to ${status}`);
  } catch (error) {
    console.error('❌ Error updating user status:', error);
  }
};

// Get online users
export const getOnlineUsers = async () => {
  try {
    const usersRef = ref(rtdb, 'users/online');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {};
    }
  } catch (error) {
    console.error('❌ Error getting online users:', error);
    return {};
  }
};

// Log user activity
export const logUserActivity = async (userId, activity) => {
  try {
    const activityRef = ref(rtdb, `users/activity/${userId}`);
    const newActivityRef = push(activityRef);
    
    await set(newActivityRef, {
      ...activity,
      timestamp: new Date().toISOString(),
      userId: userId
    });
    
    console.log(`✅ Logged activity for user ${userId}`);
  } catch (error) {
    console.error('❌ Error logging user activity:', error);
  }
};

// Update system status
export const updateSystemStatus = async (status) => {
  try {
    const systemRef = ref(rtdb, 'system');
    await update(systemRef, {
      status: status,
      lastSync: new Date().toISOString()
    });
    console.log(`✅ Updated system status to ${status}`);
  } catch (error) {
    console.error('❌ Error updating system status:', error);
  }
};

// Get system status
export const getSystemStatus = async () => {
  try {
    const systemRef = ref(rtdb, 'system');
    const snapshot = await get(systemRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return { status: 'unknown', maintenance: false };
    }
  } catch (error) {
    console.error('❌ Error getting system status:', error);
    return { status: 'error', maintenance: false };
  }
};

// Delete data for a specific month
export const deleteMonthData = async (month) => {
  try {
    const dataRef = ref(rtdb, `ipatroller/data/${month}`);
    await remove(dataRef);
    console.log(`✅ Deleted ${month} data from Realtime Database`);
    
    // Update metadata
    await updateMetadata();
    
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${month} from Realtime Database:`, error);
    return false;
  }
};

// Clear all data
export const clearAllData = async () => {
  try {
    const dataRef = ref(rtdb, 'ipatroller/data');
    await remove(dataRef);
    console.log('✅ Cleared all data from Realtime Database');
    
    // Update metadata
    await updateMetadata();
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing all data from Realtime Database:', error);
    return false;
  }
};

// Get database statistics
export const getDatabaseStats = async () => {
  try {
    const metadataRef = ref(rtdb, 'ipatroller/metadata');
    const systemRef = ref(rtdb, 'system');
    const usersRef = ref(rtdb, 'users/online');
    
    const [metadataSnapshot, systemSnapshot, usersSnapshot] = await Promise.all([
      get(metadataRef),
      get(systemRef),
      get(usersRef)
    ]);
    
    const stats = {
      metadata: metadataSnapshot.exists() ? metadataSnapshot.val() : {},
      system: systemSnapshot.exists() ? systemSnapshot.val() : {},
      onlineUsers: usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0
    };
    
    console.log('📊 Database statistics:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error getting database statistics:', error);
    return {};
  }
}; 