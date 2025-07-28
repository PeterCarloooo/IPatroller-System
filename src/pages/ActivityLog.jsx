import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Container, Card, Table, Button, Modal, Stack, Form, Row, Col, Pagination } from 'react-bootstrap';

const mockLogs = [
  { id: 1, user: 'Admin', action: 'Logged in', date: '2024-07-01 09:00', details: 'Admin logged in from IP 192.168.1.1' },
  { id: 2, user: 'User1', action: 'Created Report', date: '2024-07-01 10:15', details: 'User1 created a new incident report.' },
  { id: 3, user: 'User2', action: 'Changed Password', date: '2024-07-02 14:30', details: 'User2 changed their account password.' },
  { id: 4, user: 'User1', action: 'Logged out', date: '2024-07-02 15:00', details: 'User1 logged out.' },
  { id: 5, user: 'Admin', action: 'Deleted User', date: '2024-07-03 08:00', details: 'Admin deleted User3.' },
  { id: 6, user: 'User2', action: 'Logged in', date: '2024-07-03 09:00', details: 'User2 logged in from IP 192.168.1.2' },
  { id: 7, user: 'User1', action: 'Updated Profile', date: '2024-07-03 10:00', details: 'User1 updated their profile.' },
  { id: 8, user: 'Admin', action: 'Changed Settings', date: '2024-07-04 11:00', details: 'Admin changed system settings.' },
  { id: 9, user: 'User2', action: 'Logged out', date: '2024-07-04 12:00', details: 'User2 logged out.' },
  { id: 10, user: 'User1', action: 'Logged in', date: '2024-07-05 08:00', details: 'User1 logged in from IP 192.168.1.3' },
];

function ActivityLog() {
  const [logs, setLogs] = useState(mockLogs);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  // Unique users for filter dropdown
  const users = ['All', ...Array.from(new Set(logs.map(l => l.user)))];

  // Filtered and searched logs
  const filteredLogs = logs.filter(log => {
    const matchesUser = filterUser === 'All' || log.user === filterUser;
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchesUser && matchesSearch;
  });

  // Pagination logic
  const indexOfLast = currentPage * logsPerPage;
  const indexOfFirst = indexOfLast - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handleView = (log) => {
    setSelected(log);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setShowModal(false);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <DashboardLayout activePage="activity-log">
      <Container fluid className="py-4 px-2 px-md-4">
        <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light bg-opacity-75 p-4">
          <Stack direction="horizontal" gap={3} className="align-items-center flex-wrap">
            <div className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
              <i className="bi bi-clock-history text-warning" style={{ fontSize: '1.7rem' }}></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0" style={{ fontSize: '1.6rem', letterSpacing: '0.5px' }}>Activity Log</h2>
              <p className="text-muted mb-0" style={{ fontSize: '1.05rem' }}>View and manage system activity logs</p>
            </div>
          </Stack>
        </Card>
        <Card className="shadow-sm border-0 rounded-4" style={{ width: '100%', height: '100%', margin: 0, borderRadius: '1rem', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <Card.Body>
            <Row className="mb-3 g-2 align-items-center">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Search by user, action, or details..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </Col>
              <Col md={3}>
                <Form.Select value={filterUser} onChange={e => { setFilterUser(e.target.value); setCurrentPage(1); }}>
                  {users.map(u => <option key={u} value={u}>{u}</option>)}
                </Form.Select>
              </Col>
            </Row>
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">No activity logs.</td>
                  </tr>
                ) : currentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.user}</td>
                    <td>{log.action}</td>
                    <td>{log.date}</td>
                    <td>
                      <div className="d-grid gap-2 d-md-block">
                        <Button variant="info" size="sm" onClick={() => handleView(log)}>
                          <i className="bi bi-eye me-1"></i> View
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(log.id)}>
                          <i className="bi bi-trash me-1"></i> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                  {[...Array(totalPages)].map((_, idx) => (
                    <Pagination.Item
                      key={idx + 1}
                      active={currentPage === idx + 1}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md" contentClassName="border-0 shadow-lg rounded-4">
          <Modal.Header closeButton className="border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
            <Modal.Title className="fw-bold">Activity Details</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '1.5rem' }}>
            {selected && (
              <>
                <h5 className="fw-bold mb-2">{selected.action}</h5>
                <div className="text-muted mb-3">{selected.date}</div>
                <div className="mb-2"><strong>User:</strong> {selected.user}</div>
                <p>{selected.details}</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 pb-4">
            <div className="d-grid gap-2 d-md-block w-100">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button variant="danger" onClick={() => handleDelete(selected.id)}>
                Delete
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Container>
    </DashboardLayout>
  );
}

export default ActivityLog; 