import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';

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

function AddModal({ isOpen, onClose, onSave, initialData }) {
  const [date, setDate] = useState('');
  const [counts, setCounts] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDate('');
      setCounts({});
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  // When date changes, if initialData is present, pre-fill counts for that day
  useEffect(() => {
    if (initialData && date) {
      // initialData is an object: { MUNICIPALITY: [countForDay1, countForDay2, ...] }
      // Find the index of the selected date in the month
      const [year, month, day] = date.split('-');
      const dateObj = new Date(year, month - 1, day);
      const formatted = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });
      // Find the index of this date in the month
      let idx = -1;
      if (initialData && Object.values(initialData).length > 0) {
        const anyMuni = Object.keys(initialData)[0];
        const daysInMonth = initialData[anyMuni]?.length || 0;
        for (let i = 0; i < daysInMonth; i++) {
          const d = new Date(year, month - 1, 1 + i);
          const f = d.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          });
          if (f === formatted) {
            idx = i;
            break;
          }
        }
      }
      if (idx !== -1) {
        // Pre-fill counts for each municipality for this day
        const newCounts = {};
        Object.keys(initialData).forEach(muni => {
          newCounts[muni] = initialData[muni][idx] || '';
        });
        setCounts(newCounts);
      } else {
        setCounts({});
      }
    }
  }, [date, initialData]);

  const handleCountChange = (municipality, value) => {
    setCounts(prev => ({ ...prev, [municipality]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      setError('Date is required.');
      return;
    }
    const entries = [];
    districts.forEach(d => {
      d.municipalities.forEach(muni => {
        const val = counts[muni];
        if (val !== undefined && val !== '') {
          entries.push({ date, municipality: muni, count: Number(val) });
        }
      });
    });
    if (entries.length === 0) {
      setError('Please enter at least one count.');
      return;
    }
    setError('');
    onSave(entries);
    setSuccess('Successfully Added');
    setTimeout(() => {
      setSuccess('');
      setDate('');
      setCounts({});
    }, 2500);
  };

  return (
    <DashboardLayout activePage="add">
      <Modal show={isOpen} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{initialData ? 'Edit Daily Count' : 'Add Daily Count'}</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            {success && <Alert variant="success" className="text-center">{success}</Alert>}
            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Date</Form.Label>
              <Form.Control
                type="date"
                size="lg"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Counts per Municipality</Form.Label>
              <div className="row">
                {districts.map(d => (
                  <div className="col-12 mb-3" key={d.name}>
                    <div className="fw-bold text-success mb-2">{d.name.replace('ST', 'st').replace('ND', 'nd').replace('RD', 'rd')}</div>
                    <div className="row g-2">
                      {d.municipalities.map(muni => (
                        <div className="col-md-6 col-lg-3" key={muni}>
                          <div className="d-flex flex-column align-items-stretch">
                            <div className="text-center fw-semibold mb-1">{muni}</div>
                            <Form.Control
                              type="number"
                              min={0}
                              value={counts[muni] || ''}
                              onChange={e => handleCountChange(muni, e.target.value)}
                              placeholder="Count"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default AddModal; 