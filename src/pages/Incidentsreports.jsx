import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Container, Card, Button, Stack } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MUNICIPALITIES = [
  'Abucay', 'Bagac', 'Balanga', 'Dinalupihan', 'Hermosa', 'Limay', 'Mariveles', 'Morong', 'Orani', 'Orion', 'Pilar', 'Samal'
];
const TYPES = ['Theft', 'Assault', 'Robbery', 'Illegals', 'Other'];
const STATUSES = ['Open', 'Closed', 'Under Investigation'];
const ILLEGAL_TYPES = [
  'Illegal Drugs',
  'Illegal Gambling',
  'Illegal Logging',
  'Illegal Fishing',
  'Illegal Firearms',
  'Illegal Mining',
  'Illegal Recruitment',
  'Illegal Possession of Ammunition',
  'Illegal Possession of Explosives',
  'Illegal Possession of Bladed Weapons',
  'Illegal Possession of Stolen Property',
  'Illegal Wildlife Trade',
  'Illegal Construction',
  'Illegal Vending',
  'Illegal Parking',
  'Illegal Quarrying',
  'Illegal Dumping',
  'Illegal Peddling',
  'Illegal Possession of Counterfeit Items',
  'Others'
];

function IncidentsReports() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReport, setNewReport] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0,5),
    municipality: MUNICIPALITIES[0],
    type: TYPES[0],
    status: STATUSES[0],
    details: '',
    illegalType: ILLEGAL_TYPES[0],
    driveLink: '',
    what: '',
    when: '',
    where: '',
    who: '',
    why: '',
    how: '',
    actionTaken: '',
  });
  const [editModal, setEditModal] = useState(false);
  const [editIncident, setEditIncident] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const tabOptions = [
    { key: 'All', label: 'All' },
    { key: 'Open', label: 'Open' },
    { key: 'Closed', label: 'Closed' },
    { key: 'Under Investigation', label: 'Under Investigation' },
    { key: 'Illegals', label: 'Illegals' },
  ];
  const [selectedMonth, setSelectedMonth] = useState('All');
  const monthOptions = [
    'All',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  function getMonthName(dateStr) {
    const d = new Date(dateStr);
    return monthOptions[d.getMonth() + 1];
  }
  const filteredIncidents = incidents.filter(inc => {
    if (activeTab === 'All') {
      if (selectedMonth === 'All') return true;
      return getMonthName(inc.date) === selectedMonth;
    }
    if (activeTab === 'Illegals') {
      if (selectedMonth === 'All') return inc.type === 'Illegals';
      return inc.type === 'Illegals' && getMonthName(inc.date) === selectedMonth;
    }
    if (selectedMonth === 'All') return inc.status === activeTab;
    return inc.status === activeTab && getMonthName(inc.date) === selectedMonth;
  });
  const [moveModal, setMoveModal] = useState(false);
  const [moveIncident, setMoveIncident] = useState(null);
  const [moveStatus, setMoveStatus] = useState('Open');
  const [moveRemarks, setMoveRemarks] = useState('');

  // Print summary state
  const printSummaryRef = useRef();

  const exportSummaryToPDF = async () => {
    const input = printSummaryRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('incidents-summary.pdf');
  };

  // Fetch incidents from Firestore
  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      const q = query(collection(db, 'incidents'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setIncidents(data);
      setLoading(false);
    };
    fetchIncidents();
  }, []);

  const handleView = (incident) => {
    setSelectedIncident(incident);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      setSaving(true);
      await deleteDoc(doc(db, 'incidents', id));
      setIncidents(incidents.filter(i => i.id !== id));
      setSaving(false);
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
    setNewReport({
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0,5),
      municipality: MUNICIPALITIES[0],
      type: TYPES[0],
      status: STATUSES[0],
      details: '',
      illegalType: ILLEGAL_TYPES[0],
      driveLink: '',
      what: '',
      when: '',
      where: '',
      who: '',
      why: '',
      how: '',
      actionTaken: '',
    });
  };

  const handleAddReportChange = (e) => {
    const { name, value } = e.target;
    setNewReport(prev => ({ ...prev, [name]: value }));
  };

  const handleAddReportSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let reportToSave = { ...newReport };
    if (reportToSave.type === 'Illegals') {
      reportToSave.details = `[${reportToSave.illegalType}] ${reportToSave.details}`;
    }
    const docRef = await addDoc(collection(db, 'incidents'), reportToSave);
    setIncidents([{ id: docRef.id, ...reportToSave }, ...incidents]);
    setSaving(false);
    setShowAddModal(false);
  };

  const handleEdit = (incident) => {
    setEditIncident({ ...incident });
    setEditModal(true);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditIncident(prev => ({ ...prev, [name]: value }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let updatedIncident = { ...editIncident };
    if (updatedIncident.type === 'Illegals') {
      updatedIncident.details = `[${updatedIncident.illegalType}] ${updatedIncident.details.replace(/^\[.*?\]\s*/, '')}`;
    }
    await updateDoc(doc(db, 'incidents', updatedIncident.id), updatedIncident);
    setIncidents(incidents.map(i => (i.id === updatedIncident.id ? updatedIncident : i)));
    setSaving(false);
    setEditModal(false);
    setEditIncident(null);
  };

  const handleMove = (incident) => {
    setMoveIncident(incident);
    setMoveStatus(incident.status);
    setMoveRemarks(incident.remarks || '');
    setMoveModal(true);
  };
  const handleMoveSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const updated = { ...moveIncident, status: moveStatus, remarks: moveRemarks };
    await updateDoc(doc(db, 'incidents', moveIncident.id), { status: moveStatus, remarks: moveRemarks });
    setIncidents(incidents.map(i => (i.id === moveIncident.id ? updated : i)));
    setSaving(false);
    setMoveModal(false);
    setMoveIncident(null);
  };

  return (
    <DashboardLayout activePage="incidents-reports">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-file-alt text-danger fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Incidents Reports</h2>
            <p className="text-muted mb-0 small">View, manage, and track police incident reports</p>
          </div>
        </div>
        
        <div className="d-flex justify-content-end mb-4">
          <Button variant="primary" className="fw-bold d-flex align-items-center px-4 py-2 rounded-3" onClick={handleAdd} disabled={saving}>
            <i className="fas fa-plus me-2"></i> Add New Report
          </Button>
        </div>
        <Card className="shadow-sm border-0 rounded-4" style={{ width: '100%', height: '100%', margin: 0, borderRadius: '1rem', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', visibility: 'visible', opacity: 1 }}>
          <Card.Body className="p-0">
            <div className="d-flex justify-content-end px-3 pt-3 pb-2">
              <Button
                variant="danger"
                onClick={exportSummaryToPDF}
                className="d-flex align-items-center"
              >
                <i className="fas fa-file-pdf me-2"></i> Export to PDF
              </Button>
            </div>
            {/* Hidden print summary */}
            <div ref={printSummaryRef} className="mb-4 p-4 rounded-4 shadow-sm bg-white">
              <h2 className="fw-bold mb-3">Incidents Summary</h2>
              <p className="mb-2">Summary for current filter: <b>{activeTab}</b> {selectedMonth !== 'All' ? `- ${selectedMonth}` : ''}</p>
              <table className="table table-bordered mb-4">
                <thead>
                  <tr>
                    <th>Municipality</th>
                    <th>Type</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Group by municipality and type
                    const summary = {};
                    filteredIncidents.forEach(inc => {
                      const muni = inc.municipality;
                      const type = inc.type === 'Illegals' && inc.illegalType ? `Illegals (${inc.illegalType})` : inc.type;
                      if (!summary[muni]) summary[muni] = {};
                      summary[muni][type] = (summary[muni][type] || 0) + 1;
                    });
                    const rows = [];
                    Object.entries(summary).forEach(([muni, types]) => {
                      Object.entries(types).forEach(([type, count]) => {
                        rows.push(<tr key={muni + type}><td>{muni}</td><td>{type}</td><td>{count}</td></tr>);
                      });
                    });
                    if (rows.length === 0) return <tr><td colSpan={3} className="text-center text-muted">No data</td></tr>;
                    return rows;
                  })()}
                </tbody>
              </table>
              <div className="fw-bold">Total Incidents: {filteredIncidents.length}</div>
            </div>
            {/* Tabs Navigation */}
            <ul className="nav nav-tabs mb-3 px-3 pt-3 d-flex align-items-center justify-content-between" style={{ borderBottom: '2px solid #e9ecef' }}>
              <div className="d-flex">
                {tabOptions.map(tab => (
                  <li className="nav-item" key={tab.key}>
                    <button
                      className={`nav-link${activeTab === tab.key ? ' active fw-bold' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </div>
              <div className="ms-auto">
                <select className="form-select form-select-sm" style={{ minWidth: 140 }} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                  {monthOptions.map(month => (
                    <option key={month} value={month}>{month === 'All' ? 'All Months' : month}</option>
                  ))}
                </select>
              </div>
            </ul>
            <div className="table-responsive">
              <table className="table table-striped table-hover table-bordered align-middle mb-0 rounded-4 overflow-hidden shadow-sm">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Municipality</th>
                    <th>Details</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">Loading...</td>
                    </tr>
                  ) : filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">No incidents found.</td>
                    </tr>
                  ) : (
                    filteredIncidents.map(incident => (
                      <tr key={incident.id}>
                        <td>{incident.date}</td>
                        <td>{incident.municipality}</td>
                        <td>{
                          [
                            { label: 'What', value: incident.what },
                            { label: 'When', value: incident.when },
                            { label: 'Where', value: incident.where },
                            { label: 'Who', value: incident.who },
                            { label: 'Why', value: incident.why },
                            { label: 'How', value: incident.how },
                            { label: 'Action', value: incident.actionTaken }
                          ].map((item, idx) =>
                            item.value ? (
                              <div key={item.label} style={{ fontSize: '0.92em' }}>
                                <span className="fw-bold fst-italic">{item.label}:</span> {item.value}
                              </div>
                            ) : null
                          ) || <span className="fst-italic text-secondary">No details</span>
                        }</td>
                        <td>
                          {incident.type === 'Illegals' && incident.illegalType
                            ? `Illegals (${incident.illegalType})`
                            : incident.type}
                        </td>
                        <td>
                          <span className={`badge fw-semibold bg-${
                            incident.status === 'Open' ? 'warning' : incident.status === 'Closed' ? 'success' : 'info'
                          } bg-opacity-75`}>{incident.status}</span>
                        </td>
                        <td>{incident.remarks ? incident.remarks : <span className="fst-italic text-secondary">No remarks</span>}</td>
                        <td>
                          <div className="d-flex flex-column gap-2 align-items-center">
                            <button className="btn btn-sm btn-info w-100 d-flex align-items-center" onClick={() => handleView(incident)}>
                              <i className="fas fa-eye me-1"></i> <span className="text-start">View</span>
                            </button>
                            <button className="btn btn-sm btn-secondary w-100 d-flex align-items-center" onClick={() => handleEdit(incident)}>
                              <i className="fas fa-edit me-1"></i> <span className="text-start">Edit</span>
                            </button>
                            <button className="btn btn-sm btn-success w-100 d-flex align-items-center" onClick={() => handleMove(incident)}>
                              <i className="fas fa-random me-1"></i> <span className="text-start">Move/Remarks</span>
                            </button>
                            <button className="btn btn-sm btn-danger w-100 d-flex align-items-center" onClick={() => handleDelete(incident.id)} disabled={saving}>
                              <i className="fas fa-trash me-1"></i> <span className="text-start">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
        {/* Add Report Modal */}
        {showAddModal && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                  <h5 className="modal-title fw-bold">Add New Report</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} aria-label="Close"></button>
                </div>
                <form onSubmit={handleAddReportSubmit}>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div className="mb-3 d-flex gap-2 align-items-end">
                      <div style={{ flex: 1 }}>
                        <label className="form-label fw-semibold">Date</label>
                        <input type="date" className="form-control" name="date" value={newReport.date} onChange={handleAddReportChange} required />
                      </div>
                      <div style={{ width: 120 }}>
                        <label className="form-label fw-semibold">Time</label>
                        <input type="time" className="form-control" name="time" value={newReport.time} onChange={handleAddReportChange} required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Municipality</label>
                      <select className="form-select" name="municipality" value={newReport.municipality} onChange={handleAddReportChange} required>
                        {MUNICIPALITIES.map(muni => (
                          <option key={muni} value={muni}>{muni}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Type</label>
                      <select className="form-select" name="type" value={newReport.type} onChange={handleAddReportChange} required>
                        {TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {newReport.type === 'Illegals' && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Illegal Type</label>
                        <select className="form-select" name="illegalType" value={newReport.illegalType} onChange={handleAddReportChange} required>
                          {ILLEGAL_TYPES.map(illegal => (
                            <option key={illegal} value={illegal}>{illegal}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <select className="form-select" name="status" value={newReport.status} onChange={handleAddReportChange} required>
                        {STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3"><label className="form-label fw-semibold">What</label><input className="form-control" name="what" value={newReport.what} onChange={handleAddReportChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">When</label><input className="form-control" name="when" value={newReport.when} onChange={handleAddReportChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Where</label><input className="form-control" name="where" value={newReport.where} onChange={handleAddReportChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Who</label><input className="form-control" name="who" value={newReport.who} onChange={handleAddReportChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Why</label><input className="form-control" name="why" value={newReport.why} onChange={handleAddReportChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">How</label><input className="form-control" name="how" value={newReport.how} onChange={handleAddReportChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Action Taken</label><input className="form-control" name="actionTaken" value={newReport.actionTaken} onChange={handleAddReportChange} /></div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Google Drive Link (optional)</label>
                      <input type="url" className="form-control" name="driveLink" value={newReport.driveLink} onChange={handleAddReportChange} placeholder="https://drive.google.com/..." />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0 pb-4 px-4">
                    <button type="button" className="btn btn-secondary px-4 py-2 rounded-3" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 ms-2" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Report'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Incident Details Modal */}
        {showModal && selectedIncident && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                  <h5 className="modal-title fw-bold">Incident Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0 0 1rem 1rem' }}>
                  <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '1rem' }}>
                    <div className="card-body p-4">
                      <div className="row mb-3">
                        <div className="col-6 text-start fw-semibold">Date:</div>
                        <div className="col-6 text-end text-muted">{selectedIncident.date}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-6 text-start fw-semibold">Municipality:</div>
                        <div className="col-6 text-end text-muted">{selectedIncident.municipality}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-6 text-start fw-semibold">Type:</div>
                        <div className="col-6 text-end text-muted">{selectedIncident.type}</div>
                      </div>
                      {selectedIncident.type === 'Illegals' && selectedIncident.illegalType && (
                        <div className="row mb-3">
                          <div className="col-6 text-start fw-semibold">Illegal Type:</div>
                          <div className="col-6 text-end text-muted">{selectedIncident.illegalType}</div>
                        </div>
                      )}
                      <div className="row mb-3">
                        <div className="col-6 text-start fw-semibold">Status:</div>
                        <div className="col-6 text-end text-muted">{selectedIncident.status}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-12 fw-semibold">Details:</div>
                      </div>
                      <hr className="mb-3" style={{ borderTop: '2px dashed #ccc' }} />
                      <div className="row mb-2">
                        <div className="col-4 text-start fw-semibold">What:</div>
                        <div className="col-8 text-muted">{selectedIncident.what}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-start fw-semibold">When:</div>
                        <div className="col-8 text-muted">{selectedIncident.when}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-start fw-semibold">Where:</div>
                        <div className="col-8 text-muted">{selectedIncident.where}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-start fw-semibold">Who:</div>
                        <div className="col-8 text-muted">{selectedIncident.who}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-start fw-semibold">Why:</div>
                        <div className="col-8 text-muted">{selectedIncident.why}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-start fw-semibold">How:</div>
                        <div className="col-8 text-muted">{selectedIncident.how}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-4 text-start fw-semibold">Action Taken:</div>
                        <div className="col-8 text-muted">{selectedIncident.actionTaken}</div>
                      </div>
                      {selectedIncident.driveLink && selectedIncident.driveLink.match(/\.(jpg|jpeg|png|gif)$/i) && (
                        <div className="row mb-3">
                          <div className="col-12 text-center">
                            <div className="fw-semibold mb-2">Image Preview:</div>
                            <img src={selectedIncident.driveLink} alt="Incident" style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 12, border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }} />
                          </div>
                        </div>
                      )}
                      <div className="row mb-3">
                        <div className="col-4 text-start fw-semibold">Remarks:</div>
                        <div className="col-8 text-muted">{selectedIncident.remarks || <span className="fst-italic text-secondary">No remarks</span>}</div>
                      </div>
                      {selectedIncident.driveLink && (
                        <div className="row mb-3">
                          <div className="col-12 text-center">
                            <a className="btn btn-warning" href={selectedIncident.driveLink} target="_blank" rel="noopener noreferrer">
                              <i className="fas fa-link me-1"></i> View Link
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Incident Modal */}
        {editModal && editIncident && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                  <h5 className="modal-title fw-bold">Edit Report</h5>
                  <button type="button" className="btn-close" onClick={() => setEditModal(false)} aria-label="Close"></button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Date</label>
                      <input type="date" className="form-control" name="date" value={editIncident.date} onChange={handleEditChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Municipality</label>
                      <select className="form-select" name="municipality" value={editIncident.municipality} onChange={handleEditChange} required>
                        {MUNICIPALITIES.map(muni => (
                          <option key={muni} value={muni}>{muni}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Type</label>
                      <select className="form-select" name="type" value={editIncident.type} onChange={handleEditChange} required>
                        {TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {editIncident.type === 'Illegals' && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Illegal Type</label>
                        <select className="form-select" name="illegalType" value={editIncident.illegalType} onChange={handleEditChange} required>
                          {ILLEGAL_TYPES.map(illegal => (
                            <option key={illegal} value={illegal}>{illegal}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <select className="form-select" name="status" value={editIncident.status} onChange={handleEditChange} required>
                        {STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3"><label className="form-label fw-semibold">What</label><input className="form-control" name="what" value={editIncident.what || ''} onChange={handleEditChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">When</label><input className="form-control" name="when" value={editIncident.when || ''} onChange={handleEditChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Where</label><input className="form-control" name="where" value={editIncident.where || ''} onChange={handleEditChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Who</label><input className="form-control" name="who" value={editIncident.who || ''} onChange={handleEditChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Why</label><input className="form-control" name="why" value={editIncident.why || ''} onChange={handleEditChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">How</label><input className="form-control" name="how" value={editIncident.how || ''} onChange={handleEditChange} /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Action Taken</label><input className="form-control" name="actionTaken" value={editIncident.actionTaken || ''} onChange={handleEditChange} /></div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Google Drive Link (optional)</label>
                      <input type="url" className="form-control" name="driveLink" value={editIncident.driveLink || ''} onChange={handleEditChange} placeholder="https://drive.google.com/..." />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0 pb-4 px-4">
                    <button type="button" className="btn btn-secondary px-4 py-2 rounded-3" onClick={() => setEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 ms-2" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Move/Remarks Modal */}
        {moveModal && moveIncident && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                  <h5 className="modal-title fw-bold">Move Incident / Add Remarks</h5>
                  <button type="button" className="btn-close" onClick={() => setMoveModal(false)} aria-label="Close"></button>
                </div>
                <form onSubmit={handleMoveSubmit}>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <select className="form-select" value={moveStatus} onChange={e => setMoveStatus(e.target.value)} required>
                        {STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Remarks</label>
                      <textarea className="form-control" value={moveRemarks} onChange={e => setMoveRemarks(e.target.value)} rows={3} placeholder="Enter remarks here..."></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0 pb-4 px-4">
                    <button type="button" className="btn btn-secondary px-4 py-2 rounded-3" onClick={() => setMoveModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 ms-2" disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default IncidentsReports; 