import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db, rtdb } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import { ref as dbRef, onDisconnect, set as rtdbSet, serverTimestamp } from 'firebase/database';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [userMunicipality, setUserMunicipality] = useState(null);
  const [municipalityPrivileges, setMunicipalityPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user has specific privilege
  const hasPrivilege = (privilege) => {
    if (userRole === 'Administrator') return true; // Administrators have all privileges
    if (userRole !== 'User' || !userMunicipality) return false;
    
    const municipality = municipalityPrivileges.find(m => m.name === userMunicipality);
    return municipality && municipality.privileges && municipality.privileges.includes(privilege);
  };

  // Get user's municipality privileges
  const getUserPrivileges = () => {
    if (userRole === 'Administrator') return ['All Privileges'];
    if (userRole !== 'User' || !userMunicipality) return [];
    
    const municipality = municipalityPrivileges.find(m => m.name === userMunicipality);
    return municipality ? (municipality.privileges || []) : [];
  };

  // Check if user can access specific page
  const canAccessPage = (pageKey) => {
    if (userRole === 'Administrator') return true;
    if (userRole !== 'User') return false;

    const pagePrivilegeMap = {
      'dashboard': 'View Reports',
      'user-dashboard': 'View Reports',
      'ipatroller-status': 'View Reports',
      'command-center': 'Access Command Center',
      'incidents-reports': 'Manage Incidents',
      'reports': 'View Reports',
      'users': 'Manage Users',
      'setups': 'System Settings',
      'settings': 'System Settings',
      'profile': true, // Always accessible
      'notifications': true, // Always accessible
      'activity-log': 'View Reports'
    };

    const requiredPrivilege = pagePrivilegeMap[pageKey];
    if (requiredPrivilege === true) return true; // Always accessible
    return requiredPrivilege ? hasPrivilege(requiredPrivilege) : false;
  };

  // Check if user can access specific feature/action
  const canAccessFeature = (featureKey) => {
    if (userRole === 'Administrator') return true;
    if (userRole !== 'User') return false;

    const featurePrivilegeMap = {
      // User Management
      'add-user': 'Manage Users',
      'edit-user': 'Manage Users',
      'delete-user': 'Manage Users',
      'view-users': 'Manage Users',
      
      // Reports
      'view-reports': 'View Reports',
      'export-reports': 'Export Data',
      'print-reports': 'View Reports',
      
      // IPatroller Data
      'edit-ipatroller-data': 'Manage Incidents',
      'view-ipatroller-data': 'View Reports',
      'add-ipatroller-data': 'Manage Incidents',
      
      // Command Center
      'access-command-center': 'Access Command Center',
      'send-commands': 'Access Command Center',
      
      // System Settings
      'edit-municipality-privileges': 'System Settings',
      'edit-system-settings': 'System Settings',
      'backup-restore': 'System Settings',
      
      // Analytics
      'view-analytics': 'View Analytics',
      'export-analytics': 'Export Data',
      
      // Incidents
      'manage-incidents': 'Manage Incidents',
      'view-incidents': 'View Reports',
      'create-incident': 'Manage Incidents',
      'edit-incident': 'Manage Incidents',
      'delete-incident': 'Manage Incidents'
    };

    const requiredPrivilege = featurePrivilegeMap[featureKey];
    return requiredPrivilege ? hasPrivilege(requiredPrivilege) : false;
  };

  // Get accessible navigation items for the current user
  const getAccessibleNavItems = () => {
    const allNavItems = [
      { key: 'dashboard', icon: 'fa-home', label: 'Dashboard', to: '/dashboard' },
      { key: 'ipatroller-status', icon: 'fa-shield-alt', label: 'IPatroller Status', to: '/ipatroller-status' },
      { key: 'command-center', icon: 'fa-broadcast-tower', label: 'Command Center', to: '/command-center' },
      { key: 'incidents-reports', icon: 'fa-file-alt', label: 'Incidents Reports', to: '/incidents-reports' },
      { key: 'reports', icon: 'fa-chart-line', label: 'Reports', to: '/reports' },
      { key: 'users', icon: 'fa-users', label: 'Users', to: '/users' },
      { key: 'setups', icon: 'fa-cogs', label: 'Setups', to: '/setups' },
      { key: 'settings', icon: 'fa-cog', label: 'Settings', to: '/settings' },
    ];

    return allNavItems.filter(item => canAccessPage(item.key));
  };

  // Check if user can perform specific action on data
  const canPerformAction = (action, dataType, data = null) => {
    if (userRole === 'Administrator') return true;
    if (userRole !== 'User') return false;

    // Check if user can access the municipality data
    if (data && data.municipality && data.municipality !== userMunicipality) {
      return false; // Users can only access data from their municipality
    }

    const actionPrivilegeMap = {
      // CRUD operations
      'create': {
        'user': 'Manage Users',
        'incident': 'Manage Incidents',
        'report': 'View Reports',
        'ipatroller-data': 'Manage Incidents'
      },
      'read': {
        'user': 'Manage Users',
        'incident': 'View Reports',
        'report': 'View Reports',
        'ipatroller-data': 'View Reports',
        'municipality': 'View Reports'
      },
      'update': {
        'user': 'Manage Users',
        'incident': 'Manage Incidents',
        'report': 'View Reports',
        'ipatroller-data': 'Manage Incidents',
        'municipality': 'System Settings'
      },
      'delete': {
        'user': 'Manage Users',
        'incident': 'Manage Incidents',
        'report': 'View Reports',
        'ipatroller-data': 'Manage Incidents'
      }
    };

    const requiredPrivilege = actionPrivilegeMap[action]?.[dataType];
    return requiredPrivilege ? hasPrivilege(requiredPrivilege) : false;
  };

  // Get user's accessible municipalities (for filtering data)
  const getAccessibleMunicipalities = () => {
    if (userRole === 'Administrator') {
      // Administrators can access all municipalities
      return municipalityPrivileges.map(m => m.name);
    }
    
    // Regular users can only access their assigned municipality
    return userMunicipality ? [userMunicipality] : [];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({ uid: user.uid, ...userData });
            setUserRole(userData.role || 'User');
            setUserMunicipality(userData.municipality || null);
          } else {
            setCurrentUser({ uid: user.uid, email: user.email });
            setUserRole('User');
            setUserMunicipality(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser({ uid: user.uid, email: user.email });
          setUserRole('User');
          setUserMunicipality(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserMunicipality(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load municipality privileges
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'municipality_privileges'),
      (snapshot) => {
        const privileges = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMunicipalityPrivileges(privileges);
      },
      (error) => {
        console.error('Error loading municipality privileges:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ 
      userRole, 
      setUserRole, 
      userMunicipality, 
      setUserMunicipality,
      municipalityPrivileges,
      currentUser,
      hasPrivilege,
      getUserPrivileges,
      canAccessPage,
      canAccessFeature,
      canPerformAction,
      getAccessibleNavItems,
      getAccessibleMunicipalities,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserContext);
} 