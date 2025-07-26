import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Table, Badge, Stack, Form, Nav, Modal, Spinner } from 'react-bootstrap';
import AddModal from './add';
import { useIPatrollerData } from '../context/IPatrollerContext';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const districts = [
  {
    name: '1ST DISTRICT',
    municipalities: ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA'],
  },
  {
    name: '2ND DISTRICT',
    municipalities: ['BALANGA', 'PILAR', 'ORION', 'LIMAY'],
  },
  {
    name: '3RD DISTRICT',
    municipalities: ['BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'],
  },
];

const months = [
  { value: '2025-01', label: 'January 2025' },
  { value: '2025-02', label: 'February 2025' },
  { value: '2025-03', label: 'March 2025' },
  { value: '2025-04', label: 'April 2025' },
  { value: '2025-05', label: 'May 2025' },
  { value: '2025-06', label: 'June 2025' },
  { value: '2025-07', label: 'July 2025' },
  { value: '2025-08', label: 'August 2025' },
  { value: '2025-09', label: 'September 2025' },
  { value: '2025-10', label: 'October 2025' },
  { value: '2025-11', label: 'November 2025' },
  { value: '2025-12', label: 'December 2025' },
];

function getDateHeaders(monthValue) {
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
}

function getEmptyData(monthValue) {
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
}

// EditModal component for editing multiple dates
function EditModal({ isOpen, onClose, onSave, initialData, selectedMonth }) {
  const [counts, setCounts] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dateHeaders = getDateHeaders(selectedMonth);

  useEffect(() => {
    if (initialData && isOpen) {
      setCounts(initialData);
      setOriginalData(initialData); // Store original data for comparison
    }
  }, [initialData, isOpen]);

  const handleCountChange = (municipality, dateIndex, value) => {
    setCounts(prev => ({
      ...prev,
      [municipality]: prev[municipality] ? 
        prev[municipality].map((count, idx) => idx === dateIndex ? value : count) :
        Array(dateHeaders.length).fill('').map((count, idx) => idx === dateIndex ? value : count)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const changedEntries = [];
    
    console.log('Original data:', originalData);
    console.log('Current counts:', counts);
    
    // Save all non-empty entries (simplified approach)
    Object.keys(counts).forEach(municipality => {
      counts[municipality].forEach((newCount, dateIndex) => {
        // Only save if there's a value
        if (newCount !== '' && newCount !== undefined && newCount !== null) {
          // Convert date index back to actual date
          const [year, month] = selectedMonth.split('-');
          const date = new Date(year, month - 1, 1 + dateIndex);
          const dateString = date.toISOString().split('T')[0];
          changedEntries.push({ 
            date: dateString, 
            municipality, 
            count: Number(newCount),
            dateIndex: dateIndex
          });
        }
      });
    });

    console.log('Entries to save:', changedEntries);

    if (changedEntries.length === 0) {
      setError('Please enter at least one count.');
      return;
    }

    setError('');
    onSave(changedEntries);
    setSuccess(`Successfully Updated ${changedEntries.length} entries`);
    setTimeout(() => setSuccess(''), 2500);
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Daily Counts - {selectedMonth}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {success && <div className="alert alert-success text-center mb-3">{success}</div>}
        {error && <div className="alert alert-danger text-center mb-3">{error}</div>}
        
        <div className="table-responsive">
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th style={{ position: 'sticky', left: 0, background: '#f8f9fa', zIndex: 1 }}>Municipality</th>
                {dateHeaders.map((date, idx) => (
                  <th key={idx} className="text-center small" style={{ minWidth: 120 }}>
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {districts.map((district) => (
                <React.Fragment key={district.name}>
                  <tr className="table-secondary">
                    <td colSpan={dateHeaders.length + 1} className="fw-bold text-center">
                      {district.name.replace('ST', 'st').replace('ND', 'nd').replace('RD', 'rd')}
                    </td>
                  </tr>
                  {district.municipalities.map((muni) => (
                    <tr key={muni}>
                      <td className="fw-bold" style={{ position: 'sticky', left: 0, background: '#f8f9fa', zIndex: 1 }}>
                        {muni}
                      </td>
                      {dateHeaders.map((_, dateIndex) => (
                        <td key={dateIndex} className="p-1">
                          <input
                            type="number"
                            className="form-control form-control-sm text-center"
                            min="0"
                            value={counts[muni]?.[dateIndex] || ''}
                            onChange={(e) => handleCountChange(muni, dateIndex, e.target.value)}
                            placeholder="0"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function IPatrollerStatus() {
  const [activeTab, setActiveTab] = useState('status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loadingExcel, setLoadingExcel] = useState(false);

  // Get data from shared context
  const {
    selectedMonth,
    setSelectedMonth,
    allData,
    setAllData,
    updateMonthData,
    updateMultipleMonths,
    clearMonthData,
    clearAllData,
    getCurrentMonthData,
    getDateHeaders,
    getEmptyData,
    loading
  } = useIPatrollerData();

  const dateHeaders = getDateHeaders(selectedMonth);
  const data = getCurrentMonthData();

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = () => {
    setEditData(data);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditData(null);
  };

  const handleDeleteData = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
  };

  const handleClearThisMonth = () => {
    if (window.confirm(`Are you sure you want to delete all data for ${selectedMonth}? This action cannot be undone.`)) {
      try {
        clearMonthData(selectedMonth);
        alert(`All data for ${selectedMonth} has been cleared!`);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error clearing month data:', error);
        alert('Error clearing month data. Please try again.');
      }
    }
  };

  const handleClearAllMonths = () => {
    const monthCount = Object.keys(allData).length;
    if (window.confirm(`Are you sure you want to delete ALL data for ${monthCount} month(s)? This action cannot be undone and will remove all imported and manually entered data.`)) {
      try {
        clearAllData();
        alert(`All data for ${monthCount} month(s) has been cleared!`);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error clearing all data:', error);
        alert('Error clearing all data. Please try again.');
      }
    }
  };

  // Fetch data for a given month from Firebase and update allData
  const fetchData = async (monthToFetch) => {
    try {
      const q = query(collection(db, 'daily_counts'), where('month', '==', monthToFetch));
      const snapshot = await getDocs(q);
      const monthData = getEmptyData(monthToFetch);
      snapshot.forEach(docSnap => {
        const { date, municipality, count } = docSnap.data();
        const [year, month, day] = date.split('-');
        const dateObj = new Date(year, month - 1, day);
        const formatted = dateObj.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        });
        const idx = getDateHeaders(monthToFetch).findIndex(d => d === formatted);
        if (idx !== -1 && monthData[municipality]) {
          monthData[municipality][idx] = count;
        }
      });
      updateMonthData(monthToFetch, monthData);
      console.log(`Loaded data for ${monthToFetch}:`, monthData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoadingExcel(true);
    try {
      const allMonthsData = await readExcelFile(file);
      if (allMonthsData && Object.keys(allMonthsData).length > 0) {
        console.log('Imported data:', allMonthsData);
        
        // Use the context function to update multiple months and save to localStorage
        updateMultipleMonths(allMonthsData);
        
        const importedMonths = Object.keys(allMonthsData);
        if (importedMonths.length > 0) {
          setSelectedMonth(importedMonths[0]);
        }
        
        console.log('Data imported and saved to localStorage successfully!');
        
        const monthCount = importedMonths.length;
        alert(`Excel data imported successfully! Found and imported ${monthCount} month(s): ${importedMonths.join(', ')}\n\nData has been saved and will persist after browser refresh.`);
      } else {
        alert('No valid data found in the Excel file.');
      }
    } catch (error) {
      console.error('Error importing Excel:', error);
      alert('Error importing Excel file. Please check the file format.');
    }
    setLoadingExcel(false);
    // Reset file input
    event.target.value = '';
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const allMonthsData = detectAndExtractAllSheetsData(workbook);
          resolve(allMonthsData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const detectAndExtractAllSheetsData = (workbook) => {
    const sheetNames = workbook.SheetNames;
    console.log('Available sheets:', sheetNames);
    
    const allMonthsData = {};
    
    // Process each sheet to find month data
    for (const sheetName of sheetNames) {
      const monthInfo = detectMonthFromSheetName(sheetName);
      if (monthInfo) {
        try {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const monthData = parseExcelDataForMonth(jsonData, monthInfo.monthKey);
          
          if (monthData && Object.keys(monthData).length > 0) {
            allMonthsData[monthInfo.monthKey] = monthData;
            console.log(`Successfully processed sheet: ${sheetName} for month: ${monthInfo.monthKey}`);
          }
        } catch (error) {
          console.warn(`Error processing sheet ${sheetName}:`, error);
        }
      }
    }
    
    return allMonthsData;
  };

  const detectMonthFromSheetName = (sheetName) => {
    const monthNames = {
      '01': ['January', 'Jan', 'JAN'],
      '02': ['February', 'Feb', 'FEB'],
      '03': ['March', 'Mar', 'MAR'],
      '04': ['April', 'Apr', 'APR'],
      '05': ['May', 'MAY'],
      '06': ['June', 'Jun', 'JUN'],
      '07': ['July', 'Jul', 'JUL'],
      '08': ['August', 'Aug', 'AUG'],
      '09': ['September', 'Sep', 'SEP'],
      '10': ['October', 'Oct', 'OCT'],
      '11': ['November', 'Nov', 'NOV'],
      '12': ['December', 'Dec', 'DEC']
    };
    
    const sheetLower = sheetName.toLowerCase();
    
    // Try to find year in sheet name (e.g., "2025", "25")
    let year = null;
    const yearMatch = sheetName.match(/(20\d{2})/);
    if (yearMatch) {
      year = yearMatch[1];
    } else {
      // Default to current year if no year found
      year = new Date().getFullYear().toString();
    }
    
    // Try to find month in sheet name
    for (const [monthNum, monthVariations] of Object.entries(monthNames)) {
      for (const monthName of monthVariations) {
        if (sheetLower.includes(monthName.toLowerCase())) {
          return {
            monthKey: `${year}-${monthNum}`,
            year: year,
            month: monthNum,
            monthName: monthName
          };
        }
      }
    }
    
    return null;
  };

  const parseExcelDataForMonth = (jsonData, monthKey) => {
    const monthData = getEmptyData(monthKey);
    
    if (!jsonData || jsonData.length === 0) {
      console.log('No data to parse for month:', monthKey);
      return monthData;
    }
    
    // Get the header row (first row) to determine date mapping
    const headerRow = jsonData[0];
    
    // Create a mapping from Excel column index to actual date
    const dateMapping = [];
    const [year, monthNum] = monthKey.split('-');
    
    // Process header row to find date columns
    for (let j = 1; j < headerRow.length; j++) {
      const headerValue = headerRow[j];
      
      if (headerValue !== undefined && headerValue !== null && headerValue !== '') {
        // Try to parse the header as a date
        let day = null;
        
        // Handle different date formats in headers
        if (typeof headerValue === 'number') {
          // If header is a number, assume it's the day
          day = headerValue;
        } else if (typeof headerValue === 'string') {
          // Try to extract day from string formats like "13", "March 13", "13/3", etc.
          const dayMatch = headerValue.toString().match(/(\d{1,2})/);
          if (dayMatch) {
            day = parseInt(dayMatch[1]);
          }
        }
        
        if (day && day >= 1 && day <= 31) {
          dateMapping.push({
            excelColumnIndex: j,
            day: day,
            dateIndex: day - 1 // Convert to 0-based index for our array
          });
        }
      }
    }
    

    
    // Process data rows starting from row 1 (skip header)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length > 0) {
        const municipality = row[0]; // First column should be municipality name
        
        if (municipality && monthData[municipality]) {
          // Initialize with empty values for all days of the month
          const dailyCounts = new Array(getDateHeaders(monthKey).length).fill('');
          
          // Map Excel data to correct dates based on header mapping
          if (dateMapping.length > 0) {
            // Use header mapping if available
            dateMapping.forEach(mapping => {
              const excelValue = row[mapping.excelColumnIndex];
              
              if (excelValue !== undefined && excelValue !== null && excelValue !== '') {
                if (excelValue === 0 || excelValue === '0' || excelValue === 0.0) {
                  // Explicitly handle 0 values
                  dailyCounts[mapping.dateIndex] = 0;
                } else {
                  // Handle other numeric values
                  const numCount = Number(excelValue);
                  if (!isNaN(numCount)) {
                    dailyCounts[mapping.dateIndex] = numCount;
                  }
                }
              }
            });
          } else {
            // Fallback: map data sequentially if header parsing fails
            for (let j = 1; j < row.length && j <= dailyCounts.length; j++) {
              const excelValue = row[j];
              if (excelValue !== undefined && excelValue !== null && excelValue !== '') {
                if (excelValue === 0 || excelValue === '0' || excelValue === 0.0) {
                  dailyCounts[j - 1] = 0;
                } else {
                  const numCount = Number(excelValue);
                  if (!isNaN(numCount)) {
                    dailyCounts[j - 1] = numCount;
                  }
                }
              }
            }
          }
          
          monthData[municipality] = dailyCounts;
        }
      }
    }
    

    return monthData;
  };

  const saveImportedDataToFirebase = async (monthData, month) => {
    const entries = [];
    
    Object.keys(monthData).forEach(municipality => {
      monthData[municipality].forEach((count, dayIndex) => {
        // Save all valid values including 0
        if (count !== '' && count !== undefined && count !== null) {
          const [year, monthNum] = month.split('-');
          const date = new Date(year, monthNum - 1, 1 + dayIndex);
          const dateString = date.toISOString().split('T')[0];
          
          entries.push({
            date: dateString,
            municipality: municipality,
            count: Number(count),
            month: month
          });
        }
      });
    });
    
    if (entries.length > 0) {
      const batch = writeBatch(db);
      
      for (const entry of entries) {
        // Check if document already exists
        const q = query(
          collection(db, 'daily_counts'), 
          where('date', '==', entry.date),
          where('municipality', '==', entry.municipality)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          // Update existing document
          const docRef = doc(db, 'daily_counts', snapshot.docs[0].id);
          batch.update(docRef, {
            count: entry.count,
            updatedAt: new Date()
          });
        } else {
          // Add new document
          const docRef = doc(collection(db, 'daily_counts'));
          batch.set(docRef, {
            date: entry.date,
            municipality: entry.municipality,
            count: entry.count,
            month: entry.date.slice(0, 7),
            createdAt: new Date()
          });
        }
      }
      
      console.log('Attempting to commit import batch to Firestore:', entries);
      await batch.commit();
      console.log(`✅ Imported ${entries.length} records to Firebase`);
      // alert(`Successfully imported ${entries.length} records to Firebase!`); // Moved outside
    }
  };

  const handleSave = async (entries) => {
    try {
      // Update data using context
      entries.forEach(entry => {
        const entryMonth = entry.date.slice(0, 7);
        const headers = getDateHeaders(entryMonth);
        const monthData = allData[entryMonth] ? { ...allData[entryMonth] } : getEmptyData(entryMonth);
        
        const idx = headers.findIndex(d => {
          const [year, month, day] = entry.date.split('-');
          const dateObj = new Date(year, month - 1, day);
          const formatted = dateObj.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          });
          return formatted === d;
        });
        
        // Only update if municipality exists and has data (no adding new entries)
        if (idx !== -1 && monthData[entry.municipality]) {
          const muniArr = [...monthData[entry.municipality]];
          muniArr[idx] = entry.count;
          monthData[entry.municipality] = muniArr;
          updateMonthData(entryMonth, monthData);
        }
      });
      
      console.log('✅ Data saved to context and localStorage');
      alert('Data saved successfully!');
    } catch (error) {
      console.error('❌ Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const handleEditSave = async (entries) => {
    try {
      console.log('handleEditSave called with:', entries);
      console.log('Current selectedMonth:', selectedMonth);
      
      // Update data using context
      const monthData = allData[selectedMonth] ? { ...allData[selectedMonth] } : getEmptyData(selectedMonth);
      console.log('Current monthData before update:', monthData);
      
      // Update entries using dateIndex directly
      entries.forEach(entry => {
        console.log('Processing entry:', entry);
        
        if (monthData[entry.municipality]) {
          // Use dateIndex directly for simpler update
          const muniArr = [...monthData[entry.municipality]];
          console.log(`Before update: ${entry.municipality}[${entry.dateIndex}] = ${muniArr[entry.dateIndex]}`);
          muniArr[entry.dateIndex] = entry.count;
          console.log(`After update: ${entry.municipality}[${entry.dateIndex}] = ${muniArr[entry.dateIndex]}`);
          monthData[entry.municipality] = muniArr;
        } else {
          console.log(`Municipality ${entry.municipality} not found in monthData`);
        }
      });
      
      console.log('Updated monthData:', monthData);
      
      // Update using context
      updateMonthData(selectedMonth, monthData);
      
      console.log(`✅ ${entries.length} entries saved to context and localStorage`);
      alert(`Successfully updated ${entries.length} entries!`);
      
      setShowEditModal(false);
      setEditData(null);
    } catch (error) {
      console.error('❌ Error saving edit data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  // Test Firestore connection on component mount - DISABLED
  // useEffect(() => {
  //   async function testFirestore() {
  //     try {
  //       console.log('Testing Firestore connection...');
  //       const testRef = collection(db, 'test_connection');
  //       const testDoc = await addDoc(testRef, { 
  //         test: 'hello', 
  //         timestamp: new Date(),
  //         message: 'Firestore connection test'
  //       });
  //       console.log('✅ Firestore test write succeeded! Document ID:', testDoc.id);
  //       
  //       // Clean up test document
  //       setTimeout(async () => {
  //         try {
  //           await deleteDoc(doc(db, 'test_connection', testDoc.id));
  //           console.log('✅ Test document cleaned up');
  //         } catch (cleanupError) {
  //           console.log('⚠️ Could not clean up test document:', cleanupError);
  //         }
  //       }, 5000);
  //       
  //     } catch (error) {
  //       console.error('❌ Firestore test write failed:', error);
  //       console.error('Error details:', {
  //         code: error.code,
  //         message: error.message,
  //         stack: error.stack
  //       });
  //     }
  //   }
  //   testFirestore();
  // }, []);

  // Load all available months from Firebase on component mount - DISABLED
  // useEffect(() => {
  //   async function loadAllMonths() {
  //     try {
  //       console.log('Loading all months from Firebase...');
  //       const q = query(collection(db, 'daily_counts'));
  //       const snapshot = await getDocs(q);
  //       const availableMonths = new Set();
  //       
  //       console.log(`Found ${snapshot.size} total documents in Firebase`);
  //       
  //       snapshot.forEach(docSnap => {
  //         const data = docSnap.data();
  //         console.log('Document data:', data);
  //         const { month } = data;
  //         if (month) {
  //             availableMonths.add(month);
  //             console.log(`Added month: ${month}`);
  //           } else {
  //             console.log('Document has no month field:', data);
  //           }
  //         });
  //         
  //         const monthsArray = Array.from(availableMonths).sort();
  //         console.log('Available months in Firebase:', monthsArray);
  //         
  //         // Also log the current allData state for comparison
  //         console.log('Current allData state:', Object.keys(allData));
  //       } catch (error) {
  //         console.error('Error loading available months:', error);
  //       }
  //     }
  //     loadAllMonths();
  //   }, [allData]); // Changed dependency to allData so it runs when data changes

  // Temporarily disabled Firebase fetch to prevent overwriting imported data
  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       // Fetch data for the selected month
  //       const q = query(collection(db, 'daily_counts'), where('month', '==', selectedMonth));
  //       const snapshot = await getDocs(q);
  //       const monthData = getEmptyData(selectedMonth);
  //       
  //       snapshot.forEach(docSnap => {
  //         const { date, municipality, count } = docSnap.data();
  //         const [year, month, day] = date.split('-');
  //         const dateObj = new Date(year, month - 1, day);
  //         const formatted = dateObj.toLocaleDateString('en-US', {
  //           weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  //         });
  //         const idx = getDateHeaders(selectedMonth).findIndex(d => d === formatted);
  //         if (idx !== -1 && monthData[municipality]) {
  //           monthData[municipality][idx] = count;
  //         }
  //       });
  //       
  //       setAllData(prev => ({ ...prev, [selectedMonth]: monthData }));
  //       console.log(`Loaded data for ${selectedMonth}:`, monthData);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   }
  //   fetchData();
  // }, [selectedMonth]);

  // Helper to check if month data is empty
  function isMonthDataEmpty(monthData) {
    if (!monthData) return true;
    return Object.values(monthData).every(arr => Array.isArray(arr) && arr.every(val => val === '' || val === undefined || val === null));
  }

  return (
    <DashboardLayout activePage="ipatroller-status">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-shield-alt text-primary fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">IPatroller Status</h2>
            <p className="text-muted mb-0 small">Monitor your patrollers in real-time</p>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="border-0">
            <Nav.Item>
              <Nav.Link eventKey="status" className="border-0 text-muted">Status</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="dailyCounts" className="border-0 text-muted">Daily Counts</Nav.Link>
            </Nav.Item>
          </Nav>
          
          <div className="d-flex align-items-center gap-2" style={{ background: '#e9eef6', borderRadius: '0.75rem', padding: '4px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Form.Select
              size="sm"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border-0 shadow-none bg-white fw-semibold"
              style={{ maxWidth: '160px', borderRadius: '0.5rem', height: 40, minWidth: 120, fontSize: '1.1em', paddingLeft: 12, paddingRight: 32 }}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Form.Select>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              style={{ display: 'none' }}
              id="excel-import"
            />
            <Button
              variant="info"
              size="sm"
              onClick={() => document.getElementById('excel-import').click()}
              style={{ width: 40, height: 40, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              title="Import Excel"
            >
              <i className="fas fa-file-excel"></i>
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleAddClick}
              style={{ width: 40, height: 40, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              title="Add"
            >
              <i className="fas fa-plus"></i>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEditClick}
              style={{ width: 40, height: 40, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              title="Edit"
            >
              <i className="fas fa-edit"></i>
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={() => window.location.reload()}
              style={{ width: 40, height: 40, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              title="Refresh Data"
            >
              <i className="fas fa-sync-alt"></i>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteData}
              style={{ width: 40, height: 40, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              title="Delete Data"
            >
              <i className="fas fa-trash-alt"></i>
            </Button>
          </div>
        </div>

        {/* Excel Import Loading Indicator */}
        {loadingExcel && (
          <div className="d-flex flex-column align-items-center justify-content-center my-3">
            <div className="mb-2">
              <Spinner animation="border" role="status" size="sm" className="me-2" />
              <span>Uploading Excel, please wait…</span>
            </div>
          </div>
        )}

        {/* Data Persistence Indicator */}
        {/*{Object.keys(allData).length > 0 && (
          <div className="d-flex justify-content-center mb-3">
            <div className="alert alert-success d-flex align-items-center py-2 px-3" style={{ 
              borderRadius: '0.75rem', 
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
              border: '1px solid #c3e6cb',
              maxWidth: 'fit-content'
            }}>
              <i className="fas fa-shield-alt text-success me-2"></i>
              <span className="fw-semibold">
                ✅ Data Persistence Active: {Object.keys(allData).length} month(s) saved locally
              </span>
            </div>
          </div>
        )}*/}

        {/* Municipality Privileges Connection Indicator */}
        {/*<div className="d-flex justify-content-center mb-3">
          <div className="alert alert-info d-flex align-items-center py-2 px-3" style={{ 
            borderRadius: '0.75rem', 
            fontSize: '0.9rem',
            background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
            border: '1px solid #bee5eb',
            maxWidth: 'fit-content'
          }}>
            <i className="fas fa-link text-info me-2"></i>
            <span className="fw-semibold">
              🔗 Connected to Municipality Privileges System
            </span>
          </div>
        </div>*/}

        {activeTab === 'status' && (
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-3">
              <h4 className="fw-bold mb-3">Patroller Status Overview</h4>
              <p className="text-muted">This section will show a summary of patroller status (e.g., Active or Inactive).</p>
              <div className="table-responsive" style={{ borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'auto', maxHeight: '60vh' }}>
                <Table className="table-bordered align-middle table-hover mb-0" style={{ minWidth: 1200 }}>
                  <thead className="table-success" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th className="text-center fw-bold" style={{ background: '#d1e7dd', position: 'sticky', left: 0, zIndex: 11, minWidth: '180px', width: '180px', fontSize: '0.9em' }}>MUNICIPALITY</th>
                      {dateHeaders.map((date, idx) => (
                        <th key={idx} className="text-center fw-bold small" style={{ background: '#d1e7dd', minWidth: '160px', width: '160px', fontSize: '0.8em', padding: '8px 4px' }}>
                          {date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {districts.map((district, dIdx) => (
                      <React.Fragment key={district.name}>
                        <tr>
                          <td colSpan={dateHeaders.length + 1} className="fw-bold text-start" style={{ 
                            background: 'linear-gradient(135deg, #007bff, #0056b3)', 
                            color: 'white',
                            position: 'sticky', 
                            left: 0, 
                            zIndex: 5, 
                            fontSize: '1.05em',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                            padding: '12px 16px'
                          }}>
                            {(() => {
                              const n = dIdx + 1;
                              const ord = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                              return `${n}${ord} District`;
                            })()}
                          </td>
                        </tr>
                        {district.municipalities.map((muni, rowIdx) => (
                          <tr key={muni} style={{ transition: 'background 0.2s', backgroundColor: rowIdx % 2 === 0 ? '#f8f9fa' : 'white' }}>
                            <td className="fw-bold text-start" style={{ background: '#f8f9fa', position: 'sticky', left: 0, zIndex: 5, minWidth: '180px', width: '180px', fontSize: '0.9em' }}>{muni}</td>
                            {dateHeaders.map((_, i) => {
                              const count = data[muni]?.[i];
                              if (count === '' || count === undefined || count === null) {
                                return <td key={i} className="text-center text-muted" style={{ minWidth: '160px', width: '160px', fontSize: '0.9em', padding: '8px 4px' }}>-</td>;
                              }
                              if (Number(count) >= 5) {
                                return <td key={i} className="text-center" style={{ minWidth: '160px', width: '160px', fontSize: '0.9em', padding: '8px 4px' }}><Badge bg="success">Active</Badge></td>;
                              }
                              return <td key={i} className="text-center" style={{ minWidth: '160px', width: '160px', fontSize: '0.9em', padding: '8px 4px' }}><Badge bg="danger">Inactive</Badge></td>;
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {activeTab === 'dailyCounts' && (
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-3">
              <h4 className="fw-bold mb-3">Daily Patroller Counts</h4>
              <div className="table-responsive" style={{ borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'auto', maxHeight: '60vh' }}>
                <Table className="table-bordered align-middle table-hover mb-0" style={{ minWidth: 1200 }}>
                  <thead className="table-success" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th className="text-center fw-bold" style={{ background: '#d1e7dd', position: 'sticky', left: 0, zIndex: 11, minWidth: '180px', width: '180px', fontSize: '0.8em' }}>MUNICIPALITY</th>
                      {dateHeaders.map((date, idx) => (
                        <th key={idx} className="text-center fw-bold small" style={{ background: '#d1e7dd', minWidth: '160px', width: '160px', fontSize: '0.8em', padding: '8px 4px' }}>
                          {date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {districts.map((district, dIdx) => (
                      <React.Fragment key={district.name}>
                        <tr>
                          <td colSpan={dateHeaders.length + 1} className="fw-bold text-start" style={{ 
                            background: 'linear-gradient(135deg, #007bff, #0056b3)', 
                            color: 'white',
                            position: 'sticky', 
                            left: 0, 
                            zIndex: 5, 
                            fontSize: '1.05em',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                            padding: '12px 16px'
                          }}>
                            {(() => {
                              const n = dIdx + 1;
                              const ord = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                              return `${n}${ord} District`;
                            })()}
                          </td>
                        </tr>
                        {district.municipalities.map((muni, rowIdx) => (
                          <tr key={muni} style={{ transition: 'background 0.2s', backgroundColor: rowIdx % 2 === 0 ? '#f8f9fa' : 'white' }}>
                            <td className="fw-bold text-start" style={{ background: '#f8f9fa', position: 'sticky', left: 0, zIndex: 5, minWidth: '180px', width: '180px', fontSize: '0.9em' }}>{muni}</td>
                            {dateHeaders.map((_, i) => {
                              const count = data[muni]?.[i];
                              return (
                                <td key={i} className="text-center" style={{ minWidth: '160px', width: '160px', fontSize: '0.9em', fontWeight: '500' }}>
                                  {count === '' || count === undefined || count === null ? '-' : count}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

                        <AddModal isOpen={showAddModal} onClose={handleModalClose} onSave={handleSave} initialData={data} />
        <EditModal isOpen={showEditModal} onClose={handleEditModalClose} onSave={handleEditSave} initialData={editData} selectedMonth={selectedMonth} />
        
        {/* Delete Data Modal */}
        <Modal show={showDeleteModal} onHide={handleDeleteModalClose} centered>
          <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)', color: 'white' }}>
            <Modal.Title>
              <i className="fas fa-exclamation-triangle me-2"></i>
              Delete Data
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="text-center mb-4">
              <i className="fas fa-trash-alt text-danger" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <h5 className="fw-bold">Choose what to delete:</h5>
              <p className="text-muted">Select an option below to delete data</p>
            </div>
            
            <div className="d-grid gap-3">
              <Button 
                variant="outline-warning" 
                size="lg" 
                onClick={handleClearThisMonth}
                className="d-flex align-items-center justify-content-center py-3"
              >
                <i className="fas fa-calendar-times me-3"></i>
                <div className="text-start">
                  <div className="fw-bold">Clear This Month Only</div>
                  <small className="text-muted">Delete data for {selectedMonth}</small>
                </div>
              </Button>
              
              <Button 
                variant="outline-danger" 
                size="lg" 
                onClick={handleClearAllMonths}
                className="d-flex align-items-center justify-content-center py-3"
              >
                <i className="fas fa-trash me-3"></i>
                <div className="text-start">
                  <div className="fw-bold">Clear All Months</div>
                  <small className="text-muted">Delete all data ({Object.keys(allData).length} month(s))</small>
                </div>
              </Button>
            </div>
            
            <div className="alert alert-warning mt-4" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> This action cannot be undone. All deleted data will be permanently removed.
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleDeleteModalClose}>
              <i className="fas fa-times me-2"></i>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default IPatrollerStatus; 