import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Table, Badge, Stack, Form, Nav, Modal, Spinner } from 'react-bootstrap';
import AddModal from './add';
import { useIPatrollerData } from '../context/IPatrollerContext';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Add common styles at the top of the file
const COMMON_STYLES = {
  tableHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  fixedColumn: {
    position: 'sticky',
    left: 0,
    zIndex: 5,
    minWidth: '180px',
    width: '180px',
    fontSize: '0.9em',
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
    borderRight: '1px solid #dee2e6'
  },
  districtHeader: {
    background: 'linear-gradient(135deg, #007bff, #0056b3)',
    color: 'white',
    position: 'sticky',
    left: 0,
    zIndex: 5,
    fontSize: '1.05em',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
    padding: '12px 16px'
  },
  tableCell: {
    minWidth: '160px',
    width: '160px',
    fontSize: '0.9em',
    padding: '8px 4px'
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0
  },
  tableContainer: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto'
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    padding: '0.75rem',
    background: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  headerIcon: {
    width: 56,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  monthSelector: {
    background: '#e9eef6',
    borderRadius: '0.75rem',
    padding: '4px 8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  }
};

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
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }));
    }
    
    console.log(`Generated ${dateHeaders.length} date headers for ${monthValue}`);
    return dateHeaders;
  } catch (error) {
    console.error('Error in getDateHeaders:', error);
    return [];
  }
}

function getEmptyData(monthValue) {
  try {
    console.log('getEmptyData called with:', monthValue);
    
    // Validate month value
    if (!monthValue || typeof monthValue !== 'string' || !monthValue.match(/^\d{4}-\d{2}$/)) {
      console.warn('Invalid monthValue format:', monthValue);
      // Return safe fallback with current month
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      monthValue = `${year}-${month}`;
    }
    
    // Get the number of days in the month
    const [year, month] = monthValue.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Create empty arrays for each municipality with the correct number of days
    const emptyData = {
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
      'MORONG': new Array(daysInMonth).fill('')
    };
    
    console.log(`Created empty data structure with ${daysInMonth} days for ${monthValue}`);
    return emptyData;
  } catch (error) {
    console.error('Error in getEmptyData:', error);
    // Return safe fallback with 31 days (maximum possible)
    const safeData = {
      'ABUCAY': new Array(31).fill(''),
      'ORANI': new Array(31).fill(''),
      'SAMAL': new Array(31).fill(''),
      'HERMOSA': new Array(31).fill(''),
      'BALANGA': new Array(31).fill(''),
      'PILAR': new Array(31).fill(''),
      'ORION': new Array(31).fill(''),
      'LIMAY': new Array(31).fill(''),
      'BAGAC': new Array(31).fill(''),
      'DINALUPIHAN': new Array(31).fill(''),
      'MARIVELES': new Array(31).fill(''),
      'MORONG': new Array(31).fill('')
    };
    return safeData;
  }
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
        [value] // Safe fallback - just create array with the value
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const reportContentRef = useRef(null);
  const mainTableRef = useRef(null);

  // Get data from shared context
  const defaultMonth = months[0]?.value || (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  })();

  const {
    selectedMonth: contextSelectedMonth,
    setSelectedMonth,
    allData,
    setAllData,
    updateMonthData,
    updateMultipleMonths,
    clearMonthData,
    clearAllData,
    getCurrentMonthData,
  } = useIPatrollerData();

  const selectedMonth = contextSelectedMonth || defaultMonth;
  const dateHeaders = getDateHeaders(selectedMonth);
  const data = allData[selectedMonth] || getEmptyData(selectedMonth);

  // Debug logging
  console.log('Current State:', {
    selectedMonth,
    dateHeaders,
    data,
    allData
  });

  useEffect(() => {
    // Initialize with default data if empty
    if (!allData[selectedMonth]) {
      const emptyData = getEmptyData(selectedMonth);
      updateMonthData(selectedMonth, emptyData);
    }
  }, [selectedMonth, allData, updateMonthData]);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (!allData[month]) {
      const emptyData = getEmptyData(month);
      updateMonthData(month, emptyData);
    }
  };

  // Ensure we have valid data structures
  const validDateHeaders = dateHeaders || [];
  const validData = data || getEmptyData(selectedMonth);

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

  const handleReportModalClose = () => {
    setShowReportModal(false);
  };

  const handleReportClick = () => {
    setShowReportModal(true);
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
    
    console.log('📁 Excel file selected:', file.name, file.size, 'bytes');
    setLoadingExcel(true);
    
    try {
      // Show immediate feedback
      console.log('🔄 Starting Excel import...');
      
      const allMonthsData = await readExcelFile(file);
      console.log('📊 All months data from Excel:', allMonthsData);
      
      if (allMonthsData && Object.keys(allMonthsData).length > 0) {
        console.log('✅ Valid data found in Excel file');
        console.log('📅 Months found:', Object.keys(allMonthsData));
        
        // Skip Firebase saving for faster import - use localStorage only
        console.log('💾 Saving to localStorage only for faster import...');
        
        // Use the context function to update multiple months and save to localStorage
        console.log('🔄 Updating context with imported data...');
        await updateMultipleMonths(allMonthsData);
        
        const importedMonths = Object.keys(allMonthsData);
        if (importedMonths.length > 0) {
          console.log(`📅 Setting selected month to: ${importedMonths[0]}`);
          setSelectedMonth(importedMonths[0]);
        }
        
        console.log('✅ Data imported and saved successfully!');
        
        const monthCount = importedMonths.length;
        alert(`Excel data imported successfully! Found and imported ${monthCount} month(s): ${importedMonths.join(', ')}\n\nData has been saved to localStorage and will persist.`);
      } else {
        console.log('❌ No valid data found in Excel file');
        alert('No valid data found in the Excel file. Please check the file format.');
      }
    } catch (error) {
      console.error('❌ Error importing Excel:', error);
      alert('Error importing Excel file. Please check the file format and try again.');
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
    console.log(`🔄 Parsing Excel data for month: ${monthKey}`);
    
    const monthData = getEmptyData(monthKey);
    
    if (!jsonData || jsonData.length === 0) {
      console.log('❌ No data to parse for month:', monthKey);
      return monthData;
    }
    
    // Get the header row (first row) to determine date mapping
    const headerRow = jsonData[0];
    
    // Create a mapping from Excel column index to actual date
    const dateMapping = [];
    const [year, monthNum] = monthKey.split('-');
    
    // Process header row to find date columns (optimized)
    for (let j = 1; j < headerRow.length; j++) {
      const headerValue = headerRow[j];
      
      if (headerValue !== undefined && headerValue !== null && headerValue !== '') {
        let day = null;
        
        // Handle different date formats in headers
        if (typeof headerValue === 'number') {
          day = headerValue;
        } else if (typeof headerValue === 'string') {
          const dayMatch = headerValue.toString().match(/(\d{1,2})/);
          if (dayMatch) {
            day = parseInt(dayMatch[1]);
          }
        }
        
        if (day && day >= 1 && day <= 31) {
          dateMapping.push({
            excelColumnIndex: j,
            day: day,
            dateIndex: day - 1
          });
        }
      }
    }
    
    // Process data rows starting from row 1 (skip header) - optimized
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length > 0) {
        const municipality = row[0]; // First column should be municipality name
        
        if (municipality && monthData[municipality]) {
          // Initialize with proper array length based on month
          const daysInMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
          const dailyCounts = new Array(daysInMonth).fill('');
          
          // Map Excel data to correct dates based on header mapping
          if (dateMapping.length > 0) {
            // Use header mapping if available
            dateMapping.forEach(mapping => {
              const excelValue = row[mapping.excelColumnIndex];
              
              if (excelValue !== undefined && excelValue !== null && excelValue !== '') {
                if (excelValue === 0 || excelValue === '0' || excelValue === 0.0) {
                  dailyCounts[mapping.dateIndex] = 0;
                } else {
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
    
    console.log(`✅ Parsed ${monthKey} with ${Object.keys(monthData).length} municipalities`);
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

  // Helper to check if month data is empty
  function isMonthDataEmpty(monthData) {
    if (!monthData) return true;
    return Object.values(monthData).every(arr => Array.isArray(arr) && arr.every(val => val === '' || val === undefined || val === null));
  }

  const exportToPDF = async () => {
    const input = reportContentRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('ipatroller-report.pdf');
  };

  const exportMainTableToPDF = async () => {
    const input = mainTableRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('ipatroller-table.pdf');
  };

  return (
    <DashboardLayout activePage="ipatroller-status">
      <div style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="page-container" style={COMMON_STYLES.cardContainer}>
          {/* Header */}
          <div style={COMMON_STYLES.pageHeader}>
            <div className="bg-primary bg-opacity-10" style={COMMON_STYLES.headerIcon}>
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
              <Nav.Item>
                <Nav.Link eventKey="summary" className="border-0 text-muted">Summary Table</Nav.Link>
              </Nav.Item>
            </Nav>
            
            <div className="d-flex align-items-center gap-2" style={COMMON_STYLES.monthSelector}>
              <Form.Select
                size="sm"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="border-0 shadow-none bg-white fw-semibold"
                style={{ maxWidth: '160px', borderRadius: '0.5rem', height: 40, minWidth: 120, fontSize: '1.1em', paddingLeft: 12, paddingRight: 32 }}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
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
                style={COMMON_STYLES.actionButton}
                title="Import Excel"
              >
                <i className="fas fa-file-excel"></i>
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleAddClick}
                style={COMMON_STYLES.actionButton}
                title="Add"
              >
                <i className="fas fa-plus"></i>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEditClick}
                style={COMMON_STYLES.actionButton}
                title="Edit"
              >
                <i className="fas fa-edit"></i>
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => window.location.reload()}
                style={COMMON_STYLES.actionButton}
                title="Refresh Data"
              >
                <i className="fas fa-sync-alt"></i>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteData}
                style={COMMON_STYLES.actionButton}
                title="Delete Data"
              >
                <i className="fas fa-trash-alt"></i>
              </Button>
              <Button
                variant="info"
                size="sm"
                onClick={handleReportClick}
                style={COMMON_STYLES.actionButton}
                title="Generate Report"
              >
                <i className="fas fa-chart-line"></i>
              </Button>
            </div>
          </div>

          {/* Excel Import Loading Indicator */}
          {loadingExcel && (
            <div className="d-flex flex-column align-items-center justify-content-center my-3">
              <div className="mb-2">
                <Spinner animation="border" role="status" size="sm" className="me-2" />
                <span>Processing Excel file, please wait...</span>
              </div>
              <div className="text-muted small">
                <i className="fas fa-info-circle me-1"></i>
                Large files may take a few seconds to process
              </div>
            </div>
          )}

          {/* Content area */}
          <div style={COMMON_STYLES.cardContainer}>
            {activeTab === 'status' && (
              <Card className="shadow-sm border-0 rounded-3" style={COMMON_STYLES.cardContainer}>
                <Card.Body className="p-3" style={COMMON_STYLES.cardContainer}>
                  <h4 className="fw-bold mb-3">Patroller Status Overview</h4>
                  <div ref={mainTableRef} style={COMMON_STYLES.cardContainer}>
                    <div style={COMMON_STYLES.tableContainer}>
                      <Card className="shadow-sm rounded-4 mb-0 p-3 bg-white border-0 h-100">
                        <div className="table-responsive" style={COMMON_STYLES.tableContainer}>
                          <Table className="table-bordered align-middle table-hover mb-0" style={{ minWidth: 1200 }}>
                            <thead className="table-success" style={COMMON_STYLES.tableHeader}>
                              <tr>
                                <th className="text-center fw-bold" style={{
                                  ...COMMON_STYLES.fixedColumn,
                                  background: '#d1e7dd',
                                  zIndex: 11
                                }}>MUNICIPALITY</th>
                                {validDateHeaders.map((date, idx) => (
                                  <th key={idx} className="text-center fw-bold small" style={{
                                    ...COMMON_STYLES.tableCell,
                                    background: '#d1e7dd'
                                  }}>
                                    {date}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {districts.map((district, dIdx) => (
                                <React.Fragment key={district.name}>
                                  <tr>
                                    <td colSpan={validDateHeaders.length + 1} style={COMMON_STYLES.districtHeader}>
                                      {(() => {
                                        const n = dIdx + 1;
                                        const ord = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                                        return `${n}${ord} District`;
                                      })()}
                                    </td>
                                  </tr>
                                  {district.municipalities.map((muni, rowIdx) => (
                                    <tr key={muni} style={{ backgroundColor: rowIdx % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                      <td className="fw-bold text-start" style={{
                                        ...COMMON_STYLES.fixedColumn,
                                        background: '#f8f9fa'
                                      }}>{muni}</td>
                                      {validDateHeaders.map((_, i) => {
                                        const count = validData[muni]?.[i];
                                        if (count === '' || count === undefined || count === null) {
                                          return <td key={i} className="text-center text-muted" style={COMMON_STYLES.tableCell}>-</td>;
                                        }
                                        if (Number(count) >= 5) {
                                          return <td key={i} className="text-center" style={COMMON_STYLES.tableCell}><Badge bg="success">Active</Badge></td>;
                                        }
                                        return <td key={i} className="text-center" style={COMMON_STYLES.tableCell}><Badge bg="danger">Inactive</Badge></td>;
                                      })}
                                    </tr>
                                  ))}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Card>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {activeTab === 'dailyCounts' && (
              <Card className="shadow-sm border-0 rounded-3" style={COMMON_STYLES.cardContainer}>
                <Card.Body className="p-3" style={COMMON_STYLES.cardContainer}>
                  <h4 className="fw-bold mb-3">Daily Patroller Counts</h4>
                  <div ref={mainTableRef} style={COMMON_STYLES.cardContainer}>
                    <div style={COMMON_STYLES.tableContainer}>
                      <Card className="shadow-sm rounded-4 mb-0 p-3 bg-white border-0 h-100">
                        <div className="table-responsive" style={COMMON_STYLES.tableContainer}>
                          <Table className="table-bordered align-middle table-hover mb-0" style={{ minWidth: 1200 }}>
                            <thead className="table-primary" style={COMMON_STYLES.tableHeader}>
                              <tr>
                                <th className="text-center fw-bold" style={{ background: '#cce5ff', position: 'sticky', left: 0, zIndex: 11, minWidth: '180px', width: '180px', fontSize: '0.9em' }}>MUNICIPALITY</th>
                                {validDateHeaders.map((date, idx) => (
                                  <th key={idx} className="text-center fw-bold small" style={{ background: '#cce5ff', minWidth: '160px', width: '160px', fontSize: '0.8em', padding: '8px 4px' }}>
                                    {date}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {districts.map((district, dIdx) => (
                                <React.Fragment key={district.name}>
                                  <tr>
                                    <td colSpan={validDateHeaders.length + 1} style={COMMON_STYLES.districtHeader}>
                                      {(() => {
                                        const n = dIdx + 1;
                                        const ord = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                                        return `${n}${ord} District`;
                                      })()}
                                    </td>
                                  </tr>
                                  {district.municipalities.map((muni, rowIdx) => (
                                    <tr key={muni} style={{ backgroundColor: rowIdx % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                      <td className="fw-bold text-start" style={{ background: '#f8f9fa', position: 'sticky', left: 0, zIndex: 5, minWidth: '180px', width: '180px', fontSize: '0.9em' }}>{muni}</td>
                                      {validDateHeaders.map((_, i) => {
                                        const count = validData[muni]?.[i];
                                        return (
                                          <td key={i} className="text-center" style={COMMON_STYLES.tableCell}>
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
                      </Card>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {activeTab === 'summary' && (
              <Card className="shadow-sm border-0 rounded-3" style={COMMON_STYLES.cardContainer}>
                <Card.Body className="p-3" style={COMMON_STYLES.cardContainer}>
                  <h4 className="fw-bold mb-3">Patroller Summary Overview</h4>
                  <div ref={mainTableRef} style={COMMON_STYLES.cardContainer}>
                    <div style={COMMON_STYLES.tableContainer}>
                      <Card className="shadow-sm rounded-4 mb-0 p-3 bg-white border-0 h-100">
                        <div className="table-responsive" style={COMMON_STYLES.tableContainer}>
                          <Table className="table-bordered align-middle table-hover mb-0" style={{ minWidth: 1000 }}>
                            <thead className="table-dark" style={COMMON_STYLES.tableHeader}>
                              <tr>
                                <th className="text-center fw-bold" style={{ background: '#343a40', position: 'sticky', left: 0, zIndex: 11, minWidth: '200px', width: '200px', fontSize: '0.9em' }}>MUNICIPALITY</th>
                                <th className="text-center fw-bold" style={{ background: '#343a40', minWidth: '120px', width: '120px', fontSize: '0.9em' }}>DISTRICT</th>
                                <th className="text-center fw-bold" style={{ background: '#343a40', minWidth: '120px', width: '120px', fontSize: '0.9em' }}>TOTAL PATROLLERS</th>
                                <th className="text-center fw-bold" style={{ background: '#343a40', minWidth: '120px', width: '120px', fontSize: '0.9em' }}>ACTIVE DAYS</th>
                                <th className="text-center fw-bold" style={{ background: '#343a40', minWidth: '120px', width: '120px', fontSize: '0.9em' }}>INACTIVE DAYS</th>
                                <th className="text-center fw-bold" style={{ background: '#343a40', minWidth: '120px', width: '120px', fontSize: '0.9em' }}>AVERAGE DAILY</th>
                                <th className="text-center fw-bold" style={{ background: '#343a40', minWidth: '120px', width: '120px', fontSize: '0.9em' }}>STATUS</th>
                                <th className="text-center fw-bold" style={{ background: '#343a40', minWidth: '120px', width: '120px', fontSize: '0.9em' }}>PERFORMANCE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {districts.map((district, dIdx) => (
                                <React.Fragment key={district.name}>
                                  <tr>
                                    <td colSpan={8} style={COMMON_STYLES.districtHeader}>
                                      {(() => {
                                        const n = dIdx + 1;
                                        const ord = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                                        return `${n}${ord}`;
                                      })()}
                                    </td>
                                  </tr>
                                  {district.municipalities.map((muni, rowIdx) => {
                                    const municipalityData = validData[muni] || [];
                                    const totalPatrollers = municipalityData.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
                                    const activeDays = municipalityData.filter(count => (parseInt(count) || 0) >= 5).length;
                                    const inactiveDays = municipalityData.filter(count => (parseInt(count) || 0) < 5 && (parseInt(count) || 0) > 0).length;
                                    const averageDaily = municipalityData.length > 0 ? (totalPatrollers / municipalityData.length).toFixed(1) : 0;
                                    const status = totalPatrollers >= 5 ? 'Active' : 'Inactive';
                                    const performance = averageDaily >= 5 ? 'Excellent' : averageDaily >= 3 ? 'Good' : averageDaily >= 1 ? 'Fair' : 'Poor';
                                    
                                    return (
                                      <tr key={muni} style={{ backgroundColor: rowIdx % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                        <td className="fw-bold text-start" style={{ background: '#f8f9fa', position: 'sticky', left: 0, zIndex: 5, minWidth: '200px', width: '200px', fontSize: '0.9em' }}>{muni}</td>
                                        <td className="text-center" style={{ minWidth: '120px', width: '120px', fontSize: '0.9em' }}>
                                          {(() => {
                                            const n = dIdx + 1;
                                            const ord = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                                            return `${n}${ord}`;
                                          })()}
                                        </td>
                                        <td className="text-center fw-bold" style={{ minWidth: '120px', width: '120px', fontSize: '0.9em' }}>{totalPatrollers}</td>
                                        <td className="text-center" style={{ minWidth: '120px', width: '120px', fontSize: '0.9em' }}>
                                          <Badge bg="success">{activeDays}</Badge>
                                        </td>
                                        <td className="text-center" style={{ minWidth: '120px', width: '120px', fontSize: '0.9em' }}>
                                          <Badge bg="warning">{inactiveDays}</Badge>
                                        </td>
                                        <td className="text-center fw-bold" style={{ minWidth: '120px', width: '120px', fontSize: '0.9em' }}>{averageDaily}</td>
                                        <td className="text-center" style={{ minWidth: '120px', width: '120px', fontSize: '0.9em' }}>
                                          <Badge bg={status === 'Active' ? 'success' : 'danger'}>{status}</Badge>
                                        </td>
                                        <td className="text-center" style={{ minWidth: '120px', width: '120px', fontSize: '0.9em' }}>
                                          <Badge bg={
                                            performance === 'Excellent' ? 'success' : 
                                            performance === 'Good' ? 'primary' : 
                                            performance === 'Fair' ? 'warning' : 'danger'
                                          }>{performance}</Badge>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Card>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>

          <AddModal isOpen={showAddModal} onClose={handleModalClose} onSave={handleSave} initialData={data} />
          <EditModal isOpen={showEditModal} onClose={handleEditModalClose} onSave={handleEditSave} initialData={editData} selectedMonth={selectedMonth} />
        
        {/* Report Modal */}
        <Modal show={showReportModal} onHide={handleReportModalClose} size="lg" centered>
          <Modal.Header closeButton style={{ 
            background: 'linear-gradient(135deg, #007bff, #0056b3)', 
            color: 'white',
            borderBottom: 'none'
          }}>
            <Modal.Title className="d-flex align-items-center">
              <i className="fas fa-chart-line me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <div className="fw-bold">Patroller Performance Report</div>
                <small className="opacity-75">Comprehensive analysis and insights</small>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div ref={reportContentRef}>
              {/* Report Header */}
              <div className="p-4" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h4 className="fw-bold mb-1">1Bataan I-Patroller System</h4>
                    <p className="text-muted mb-0">Provincial Government of Bataan</p>
                    <small className="text-muted">Generated on {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</small>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Ph_seal_bataan2.png" 
                        alt="Bataan Seal" 
                        style={{ width: '50px', height: '50px', marginRight: '10px' }}
                      />
                      <div>
                        <div className="fw-bold">Official Report</div>
                        <small className="text-muted">Security Division</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-4">
                {/* Summary Statistics */}
                <div className="row mb-4 g-4">
                  <div className="col-md-3">
                    <Card className="text-center border-0 shadow-sm rounded-4 h-100 bg-success bg-gradient text-white">
                      <Card.Body className="p-4">
                        <i className="fas fa-users mb-2" style={{ fontSize: '2rem' }}></i>
                        <h4 className="fw-bold mb-1">
                          {Object.values(validData).reduce((sum, municipalityData) =>
                            sum + municipalityData.reduce((daySum, count) => daySum + (parseInt(count) || 0), 0), 0
                          )}
                        </h4>
                        <p className="mb-0 small">Total Patrollers</p>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-3">
                    <Card className="text-center border-0 shadow-sm rounded-4 h-100 bg-primary bg-gradient text-white">
                      <Card.Body className="p-4">
                        <i className="fas fa-map-marker-alt mb-2" style={{ fontSize: '2rem' }}></i>
                        <h4 className="fw-bold mb-1">{Object.keys(validData).length}</h4>
                        <p className="mb-0 small">Municipalities</p>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-3">
                    <Card className="text-center border-0 shadow-sm rounded-4 h-100 bg-warning bg-gradient text-white">
                      <Card.Body className="p-4">
                        <i className="fas fa-calendar-check mb-2" style={{ fontSize: '2rem' }}></i>
                        <h4 className="fw-bold mb-1">{validDateHeaders.length}</h4>
                        <p className="mb-0 small">Days Monitored</p>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-3">
                    <Card className="text-center border-0 shadow-sm rounded-4 h-100 bg-purple bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #6f42c1, #5a2d91)' }}>
                      <Card.Body className="p-4">
                        <i className="fas fa-chart-line mb-2" style={{ fontSize: '2rem' }}></i>
                        <h4 className="fw-bold mb-1">
                          {validDateHeaders.length > 0 ?
                            (Object.values(validData).reduce((sum, municipalityData) =>
                              sum + municipalityData.reduce((daySum, count) => daySum + (parseInt(count) || 0), 0), 0
                            ) / validDateHeaders.length).toFixed(1) : 0
                          }
                        </h4>
                        <p className="mb-0 small">Daily Average</p>
                      </Card.Body>
                    </Card>
                  </div>
                </div>

                {/* Municipality Performance Table */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="fas fa-table me-2"></i>
                    Municipality Performance Summary
                  </h5>
                  <div className="table-responsive rounded-4 shadow-sm">
                    <Table className="table-bordered table-hover mb-0 align-middle" style={{ fontSize: '0.95rem', background: '#fff' }}>
                      <thead className="table-dark">
                        <tr>
                          <th className="text-center">Municipality</th>
                          <th className="text-center">Total Patrollers</th>
                          <th className="text-center">Active Days</th>
                          <th className="text-center">Inactive Days</th>
                          <th className="text-center">Daily Average</th>
                          <th className="text-center">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(validData).map((municipality, index) => {
                          const municipalityData = validData[municipality] || [];
                          const totalPatrollers = municipalityData.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
                          const activeDays = municipalityData.filter(count => (parseInt(count) || 0) >= 5).length;
                          const inactiveDays = municipalityData.filter(count => (parseInt(count) || 0) < 5 && (parseInt(count) || 0) > 0).length;
                          const averageDaily = municipalityData.length > 0 ? (totalPatrollers / municipalityData.length).toFixed(1) : 0;
                          const performance = averageDaily >= 5 ? 'Excellent' : averageDaily >= 3 ? 'Good' : averageDaily >= 1 ? 'Fair' : 'Poor';
                          return (
                            <tr key={municipality} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                              <td className="fw-bold">{municipality}</td>
                              <td className="text-center fw-bold">{totalPatrollers}</td>
                              <td className="text-center">
                                <Badge bg="success">{activeDays}</Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg="warning">{inactiveDays}</Badge>
                              </td>
                              <td className="text-center fw-bold">{averageDaily}</td>
                              <td className="text-center">
                                <Badge bg={
                                  performance === 'Excellent' ? 'success' :
                                  performance === 'Good' ? 'primary' :
                                  performance === 'Fair' ? 'warning' : 'danger'
                                }>{performance}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mb-4 row g-4">
                  <div className="col-md-6">
                    <Card className="border-0 shadow-sm h-100 rounded-4">
                      <Card.Body>
                        <h6 className="fw-bold text-primary mb-3">
                          <i className="fas fa-arrow-up me-2"></i>
                          Areas for Improvement
                        </h6>
                        <ul className="list-unstyled mb-0">
                          {Object.keys(validData).filter(municipality => {
                            const municipalityData = validData[municipality] || [];
                            const averageDaily = municipalityData.length > 0 ?
                              municipalityData.reduce((sum, count) => sum + (parseInt(count) || 0), 0) / municipalityData.length : 0;
                            return averageDaily < 3;
                          }).slice(0, 3).map(municipality => (
                            <li key={municipality} className="mb-2">
                              <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                              <strong>{municipality}</strong> - Increase patroller deployment
                            </li>
                          ))}
                        </ul>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-6">
                    <Card className="border-0 shadow-sm h-100 rounded-4">
                      <Card.Body>
                        <h6 className="fw-bold text-success mb-3">
                          <i className="fas fa-star me-2"></i>
                          Top Performers
                        </h6>
                        <ul className="list-unstyled mb-0">
                          {Object.keys(validData).filter(municipality => {
                            const municipalityData = validData[municipality] || [];
                            const averageDaily = municipalityData.length > 0 ?
                              municipalityData.reduce((sum, count) => sum + (parseInt(count) || 0), 0) / municipalityData.length : 0;
                            return averageDaily >= 5;
                          }).slice(0, 3).map(municipality => (
                            <li key={municipality} className="mb-2">
                              <i className="fas fa-check-circle text-success me-2"></i>
                              <strong>{municipality}</strong> - Excellent performance
                            </li>
                          ))}
                        </ul>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
            <div className="d-flex justify-content-between w-100">
              <div>
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Official Document - Provincial Government of Bataan
                </small>
              </div>
              <div>
                <Button variant="outline-secondary" onClick={handleReportModalClose} className="me-2">
                  <i className="fas fa-times me-2"></i>
                  Close
                </Button>
                <Button variant="danger" onClick={exportToPDF}>
                  <i className="fas fa-file-pdf me-2"></i>
                  Export PDF
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Modal>
        
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