import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Container, Card, Table, Button, Modal, Stack } from 'react-bootstrap';

const mockNotifications = [
  { id: 1, title: 'System Update', message: 'The system will be updated at midnight.', date: '2024-07-01', read: false },
  { id: 2, title: 'New User Registered', message: 'A new user has registered.', date: '2024-07-02', read: true },
  { id: 3, title: 'Incident Reported', message: 'A new incident has been reported in Balanga.', date: '2024-07-03', read: false },
];

function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleView = (notification) => {
    setSelected(notification);
    setShowModal(true);
    setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, read: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setShowModal(false);
  };

  return (
    <DashboardLayout activePage="notifications">
      <Container fluid className="py-4 px-2 px-md-4">
        <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light bg-opacity-75 p-4">
          <Stack direction="horizontal" gap={3} className="align-items-center flex-wrap">
            <div className="d-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
              <i className="bi bi-bell-fill text-info" style={{ fontSize: '1.7rem' }}></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0" style={{ fontSize: '1.6rem', letterSpacing: '0.5px' }}>Notifications</h2>
              <p className="text-muted mb-0" style={{ fontSize: '1.05rem' }}>View and manage your notifications</p>
            </div>
          </Stack>
        </Card>
        <Card className="shadow-sm border-0 rounded-4" style={{ width: '100%', height: '100%', margin: 0, borderRadius: '1rem', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <Card.Body>
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">No notifications.</td>
                  </tr>
                ) : notifications.map((n) => (
                  <tr key={n.id} className={n.read ? '' : 'fw-bold'}>
                    <td>{n.title}</td>
                    <td>{n.date}</td>
                    <td>{n.read ? 'Read' : 'Unread'}</td>
                    <td>
                      <div className="d-grid gap-2 d-md-block">
                        <Button variant="info" size="sm" onClick={() => handleView(n)}>
                          <i className="bi bi-eye me-1"></i> View
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(n.id)}>
                          <i className="bi bi-trash me-1"></i> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md" contentClassName="border-0 shadow-lg rounded-4">
          <Modal.Header closeButton className="border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
            <Modal.Title className="fw-bold">Notification Details</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '1.5rem' }}>
            {selected && (
              <>
                <h5 className="fw-bold mb-2">{selected.title}</h5>
                <div className="text-muted mb-3">{selected.date}</div>
                <p>{selected.message}</p>
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

export default Notifications; 