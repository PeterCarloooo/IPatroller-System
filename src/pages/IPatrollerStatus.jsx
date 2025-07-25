import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AddModal from './add';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { updateDoc, doc as firestoreDoc } from 'firebase/firestore';

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
  const endDate = new Date(year, month, 0); // last day of month
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

function IPatrollerStatus() {
  const [activeTab, setActiveTab] = useState('status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const dateHeaders = getDateHeaders(selectedMonth);

  // Store all months' data in state
  const [allData, setAllData] = useState({
    '2025-07': getEmptyData('2025-07'),
  });

  // Ensure data for selected month exists
  const data = allData[selectedMonth] || getEmptyData(selectedMonth);

  // When switching months, initialize if not present
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setAllData(prev => {
      if (prev[month]) return prev;
      return { ...prev, [month]: getEmptyData(month) };
    });
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };
  const handleEditClick = () => {
    // Prepare data for editing: convert allData[selectedMonth] to the AddModal format
    const monthData = allData[selectedMonth] || getEmptyData(selectedMonth);
    setEditData({ ...monthData });
    setShowEditModal(true);
  };
  const handleModalClose = () => {
    setShowAddModal(false);
  };
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditData(null);
  };
  const handleSave = async (entries) => {
    // entries: array of { date, municipality, count }
    setAllData(prev => {
      let updated = { ...prev };
      entries.forEach(entry => {
        const entryMonth = entry.date.slice(0, 7);
        const headers = getDateHeaders(entryMonth);
        const monthData = updated[entryMonth] ? { ...updated[entryMonth] } : getEmptyData(entryMonth);
        const idx = headers.findIndex(d => {
          const [year, month, day] = entry.date.split('-');
          const dateObj = new Date(year, month - 1, day);
          const formatted = dateObj.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          });
          return formatted === d;
        });
        if (idx !== -1) {
          const muniArr = monthData[entry.municipality] ? [...monthData[entry.municipality]] : Array(headers.length).fill('');
          muniArr[idx] = entry.count;
          monthData[entry.municipality] = muniArr;
        }
        updated[entryMonth] = monthData;
      });
      return updated;
    });
    await Promise.all(entries.map(entry =>
      addDoc(collection(db, 'daily_counts'), {
        date: entry.date,
        municipality: entry.municipality,
        count: entry.count,
        month: entry.date.slice(0, 7)
      })
    ));
    // Do not close the modal after save
  };

  const handleEditSave = async (entries) => {
    // Remove all existing daily_counts for this month and re-add (for demo; in production, update by doc id)
    // For now, just add new entries and update local state
    setAllData(prev => {
      const monthData = prev[selectedMonth] ? { ...prev[selectedMonth] } : getEmptyData(selectedMonth);
      entries.forEach(entry => {
        const idx = dateHeaders.findIndex(d => {
          const [year, month, day] = entry.date.split('-');
          const dateObj = new Date(year, month - 1, day);
          const formatted = dateObj.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          });
          return formatted === d;
        });
        if (idx !== -1) {
          const muniArr = monthData[entry.municipality] ? [...monthData[entry.municipality]] : Array(dateHeaders.length).fill('');
          muniArr[idx] = entry.count;
          monthData[entry.municipality] = muniArr;
        }
      });
      return { ...prev, [selectedMonth]: monthData };
    });
    await Promise.all(entries.map(entry =>
      addDoc(collection(db, 'daily_counts'), {
        date: entry.date,
        municipality: entry.municipality,
        count: entry.count,
        month: entry.date.slice(0, 7)
      })
    ));
    setShowEditModal(false);
    setEditData(null);
  };

  // Fetch data from Firestore on mount and when selectedMonth changes
  useEffect(() => {
    async function fetchData() {
      const q = query(collection(db, 'daily_counts'), where('month', '==', selectedMonth));
      const snapshot = await getDocs(q);
      const monthData = getEmptyData(selectedMonth);
      snapshot.forEach(docSnap => {
        const { date, municipality, count } = docSnap.data();
        const [year, month, day] = date.split('-');
        const dateObj = new Date(year, month - 1, day);
        const formatted = dateObj.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        });
        const idx = getDateHeaders(selectedMonth).findIndex(d => d === formatted);
        if (idx !== -1 && monthData[municipality]) {
          monthData[municipality][idx] = count;
        }
      });
      setAllData(prev => ({ ...prev, [selectedMonth]: monthData }));
    }
    fetchData();
  }, [selectedMonth]);

  return (
    <div style={{ height: '100%', minHeight: '100vh', width: '100%', minWidth: '100vw', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      <DashboardLayout activePage="ipatroller-status">
        <div className="bg-white shadow-sm rounded-4 p-4 mb-4">
          <h2 className="fw-bold mb-0">IPatroller Status</h2>
          <p className="text-muted mb-0">Monitor your patrollers in real-time</p>
        </div>
        {/* Month selection and Add button always visible */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div></div>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select w-auto"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <button
              className="btn btn-success ms-2"
              onClick={handleAddClick}
            >
              Add
            </button>
            <button
              className="btn btn-primary ms-2"
              onClick={handleEditClick}
            >
              Edit
            </button>
          </div>
        </div>
        <ul className="nav nav-tabs mb-4 d-flex align-items-center justify-content-between">
          <div className="d-flex">
            <li className="nav-item">
              <button className={`nav-link${activeTab === 'status' ? ' active' : ''}`} onClick={() => setActiveTab('status')}>
                Status
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link${activeTab === 'daily' ? ' active' : ''}`} onClick={() => setActiveTab('daily')}>
                Daily Counts
              </button>
            </li>
          </div>
        </ul>
        <div className="tab-content">
          <div className={`tab-pane fade${activeTab === 'status' ? ' show active' : ''}`}>
            <div className="card shadow-sm p-4">
              <h4 className="fw-bold mb-3">Patroller Status Overview</h4>
              <p className="text-muted">This section will show a summary of patroller status (e.g., Active or Inactive).</p>
              <div className="table-responsive" style={{ maxHeight: '70vh', overflow: 'auto', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <table className="table table-bordered table-striped align-middle table-hover mb-0" style={{ minWidth: 1200 }}>
                  <thead className="table-success">
                    <tr>
                      <th
                        style={{
                          width: 'auto',
                          height: 48,
                          position: 'sticky',
                          top: 0,
                          left: 0,
                          zIndex: 10,
                          background: '#198754',
                          color: '#fff',
                          verticalAlign: 'middle',
                          textAlign: 'center',
                          boxShadow: '2px 0 4px -2px rgba(0,0,0,0.05)',
                          borderRight: '2px solid #fff',
                          borderBottom: '2px solid #145c32',
                          padding: '0.5rem',
                          whiteSpace: 'normal',
                          overflow: 'visible',
                          textOverflow: 'clip',
                        }}
                      >
                        MUNICIPALITY
                      </th>
                      {dateHeaders.map((date, idx) => (
                        <th
                          key={idx}
                          style={{
                            minWidth: 90,
                            maxWidth: 90,
                            width: 90,
                            height: 48,
                            fontSize: '0.75em',
                            position: 'sticky',
                            top: 0,
                            zIndex: 5,
                            background: '#198754',
                            color: '#fff',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            borderBottom: '2px solid #145c32',
                            padding: '0.25rem',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          }}
                        >
                          {date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {districts.map((district, dIdx) => (
                      <React.Fragment key={district.name}>
                        <tr style={{ background: '#145c32', color: '#fff', fontWeight: 'bold', height: 48 }}>
                          <td
                            style={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 4,
                              background: '#145c32',
                              color: '#fff',
                              textAlign: 'left',
                              fontWeight: 'bold',
                              borderRight: '2px solid #fff',
                              minWidth: 120,
                              maxWidth: 120,
                              width: 120,
                              height: 48,
                              verticalAlign: 'middle',
                              padding: '0.5rem',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                            colSpan={1}
                          >
                            {(() => {
                              const n = dIdx + 1;
                              const ord = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                              return `${n}${ord} District`;
                            })()}
                          </td>
                          <td colSpan={dateHeaders.length} style={{ background: '#145c32', color: '#fff', height: 48, padding: '0.5rem' }}></td>
                        </tr>
                        {district.municipalities.map((muni) => (
                          <tr key={muni} style={{ height: 48 }}>
                            <td
                              style={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 3,
                                background: '#fff',
                                fontWeight: 'bold',
                                borderRight: '2px solid #e9ecef',
                                textAlign: 'left',
                                verticalAlign: 'middle',
                                boxShadow: '2px 0 4px -2px rgba(0,0,0,0.05)',
                                minWidth: 120,
                                maxWidth: 120,
                                width: 120,
                                height: 48,
                                padding: '0.5rem',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                              }}
                            >
                              {muni}
                            </td>
                            {dateHeaders.map((_, i) => {
                              const count = data[muni][i];
                              if (count === '' || count === undefined) {
                                return <td key={i} style={{ textAlign: 'center', verticalAlign: 'middle', background: '#f8f9fa', minWidth: 90, maxWidth: 90, width: 90, height: 48, padding: '0.25rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>-</td>;
                              }
                              if (Number(count) >= 5) {
                                return <td key={i} style={{ textAlign: 'center', verticalAlign: 'middle', background: '#f8f9fa', minWidth: 90, maxWidth: 90, width: 90, height: 48, padding: '0.25rem', whiteSpace: 'normal', wordBreak: 'break-word' }}><span className="badge bg-success">Active</span></td>;
                              }
                              return <td key={i} style={{ textAlign: 'center', verticalAlign: 'middle', background: '#f8f9fa', minWidth: 90, maxWidth: 90, width: 90, height: 48, padding: '0.25rem', whiteSpace: 'normal', wordBreak: 'break-word' }}><span className="badge bg-danger">Inactive</span></td>;
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className={`tab-pane fade${activeTab === 'daily' ? ' show active' : ''}`}>
            <div className="table-responsive" style={{ maxHeight: '70vh', overflow: 'auto', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <table className="table table-bordered table-striped align-middle table-hover mb-0" style={{ minWidth: 1200 }}>
                <thead className="table-success">
                  <tr>
                    <th
                      style={{
                        minWidth: 120,
                        maxWidth: 120,
                        width: 120,
                        height: 48,
                        position: 'sticky',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                        background: '#198754',
                        color: '#fff',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        boxShadow: '2px 0 4px -2px rgba(0,0,0,0.05)',
                        borderRight: '2px solid #fff',
                        borderBottom: '2px solid #145c32',
                        padding: '0.5rem',
                        whiteSpace: 'nowrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      MUNICIPALITY
                    </th>
                    {dateHeaders.map((date, idx) => (
                      <th
                        key={idx}
                        style={{
                          minWidth: 90,
                          maxWidth: 90,
                          width: 90,
                          height: 48,
                          fontSize: '0.75em',
                          position: 'sticky',
                          top: 0,
                          zIndex: 5,
                          background: '#198754',
                          color: '#fff',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          borderBottom: '2px solid #145c32',
                          padding: '0.25rem',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {districts.map((district, dIdx) => (
                    <React.Fragment key={district.name}>
                      <tr style={{ background: '#145c32', color: '#fff', fontWeight: 'bold', height: 48 }}>
                        <td
                          style={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 4,
                            background: '#145c32',
                            color: '#fff',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            borderRight: '2px solid #fff',
                            minWidth: 120,
                            maxWidth: 120,
                            width: 120,
                            height: 48,
                            verticalAlign: 'middle',
                            padding: '0.5rem',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          }}
                          colSpan={1}
                        >
                          {/* Display as '1st District', '2nd District', etc. */}
                          {(() => {
                            const n = dIdx + 1;
                            const ord = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                            return `${n}${ord} District`;
                          })()}
                        </td>
                        <td colSpan={dateHeaders.length} style={{ background: '#145c32', color: '#fff', height: 48, padding: '0.5rem' }}></td>
                      </tr>
                      {district.municipalities.map((muni) => (
                        <tr key={muni} style={{ height: 48 }}>
                          <td
                            style={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 3,
                              background: '#fff',
                              fontWeight: 'bold',
                              borderRight: '2px solid #e9ecef',
                              textAlign: 'left',
                              verticalAlign: 'middle',
                              boxShadow: '2px 0 4px -2px rgba(0,0,0,0.05)',
                              minWidth: 120,
                              maxWidth: 120,
                              width: 120,
                              height: 48,
                              padding: '0.5rem',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                          >
                            {muni}
                          </td>
                          {data[muni].map((val, i) => (
                            <td key={i} style={{ textAlign: 'center', verticalAlign: 'middle', background: '#f8f9fa', minWidth: 90, maxWidth: 90, width: 90, height: 48, padding: '0.25rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <AddModal isOpen={showAddModal} onClose={handleModalClose} onSave={handleSave} />
        <AddModal isOpen={showEditModal} onClose={handleEditModalClose} onSave={handleEditSave} initialData={editData} />
      </DashboardLayout>
    </div>
  );
}

export default IPatrollerStatus; 