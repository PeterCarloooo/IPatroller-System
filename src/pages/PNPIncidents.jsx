import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const filteredIncidents = incidents.filter(inc => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Illegals') return inc.type === 'Illegals';
    return inc.status === activeTab;
  });

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

  return (
    <DashboardLayout activePage="incidents-reports">
      <div className="bg-white shadow-sm rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-0">Incidents Reports</h2>
          <p className="text-muted mb-0">View, manage, and track police incident reports</p>
        </div>
        <button className="btn btn-primary fw-bold" onClick={handleAdd} disabled={saving}>
          <i className="fas fa-plus me-2"></i> Add New Report
        </button>
      </div>
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {/* Tabs Navigation */}
          <ul className="nav nav-tabs mb-3 px-3 pt-3" style={{ borderBottom: '2px solid #e9ecef' }}>
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
          </ul>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Municipality</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">Loading...</td>
                  </tr>
                ) : filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">No incidents found.</td>
                  </tr>
                ) : (
                  filteredIncidents.map(incident => (
                    <tr key={incident.id}>
                      <td>{incident.date}</td>
                      <td>{incident.municipality}</td>
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
                      <td>
                        <button className="btn btn-sm btn-info me-2" onClick={() => handleView(incident)}>
                          <i className="fas fa-eye me-1"></i> View
                        </button>
                        {incident.driveLink && (
                          <a className="btn btn-sm btn-warning me-2" href={incident.driveLink} target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-link me-1"></i> View Link
                          </a>
                        )}
                        <button className="btn btn-sm btn-secondary me-2" onClick={() => handleEdit(incident)}>
                          <i className="fas fa-edit me-1"></i> Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(incident.id)} disabled={saving}>
                          <i className="fas fa-trash me-1"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Date</label>
                    <input type="date" className="form-control" name="date" value={newReport.date} onChange={handleAddReportChange} required />
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
    </DashboardLayout>
  );
}

export default IncidentsReports; 