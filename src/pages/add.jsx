import React, { useState } from 'react';

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

  // When initialData changes (edit mode), clear counts and date
  React.useEffect(() => {
    setCounts({});
    setDate('');
  }, [initialData, isOpen]);

  // When date changes, if initialData is present, pre-fill counts for that day
  React.useEffect(() => {
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
    setTimeout(() => setSuccess(''), 2500);
    setDate('');
    setCounts({});
    // Do not close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4" style={{ background: '#fff' }}>
          <div className="modal-header border-0 pb-0" style={{ background: '#f5f7fa', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
            <h5 className="modal-title fw-bold">{initialData ? 'Edit Daily Count' : 'Add Daily Count'}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1.5rem' }}>
              {success && <div className="alert alert-success text-center mb-3">{success}</div>}
              <div className="mb-3">
                <label className="form-label fw-semibold">Date</label>
                <input
                  type="date"
                  className="form-control form-control-lg rounded-3"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Counts per Municipality</label>
                <div className="row">
                  {districts.map(d => (
                    <div className="col-12 mb-2" key={d.name}>
                      <div className="fw-bold text-success mb-2">{d.name.replace('ST', 'st').replace('ND', 'nd').replace('RD', 'rd')}</div>
                      <div className="row g-2">
                        {d.municipalities.map(muni => (
                          <div className="col-md-6 col-lg-3" key={muni}>
                            <div className="d-flex flex-column align-items-stretch">
                              <div className="text-center fw-semibold mb-1">{muni}</div>
                              <input
                                type="number"
                                className="form-control"
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
              </div>
              {error && <div className="alert alert-danger text-center mb-3">{error}</div>}
            </div>
            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-3" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 ms-2">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddModal; 