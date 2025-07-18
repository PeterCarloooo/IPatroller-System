import React, { useState, useMemo, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Nav,
  Button,
  Toast,
  ToastContainer,
  Card
} from 'react-bootstrap';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import patrollerService from '../services/patrollerService';

// Memoized formatDate function
const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00Z'); // Use UTC time
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to check if a date is in the selected month
const isDateInMonth = (dateStr, year, month) => {
  const date = new Date(dateStr + 'T12:00:00Z'); // Use UTC time
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1;
};

// Memoized header cell component
const HeaderCell = memo(({ children, isFirst = false }) => (
  <th 
    className={`text-center align-middle ${isFirst ? 'position-sticky start-0' : ''}`}
                style={{ 
                  top: 0,
      minWidth: isFirst ? 200 : 180,
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: 600,
      zIndex: isFirst ? 3 : 2,
      backgroundColor: '#0d6efd',
      color: 'white',
      height: '50px',
      ...(isFirst && {
        borderRight: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '2px 0px 3px -1px rgba(0,0,0,0.2)'
      })
    }}
  >
    {children}
              </th>
));

// Memoized table header component
const TableHeader = memo(({ dates, selectedYear, selectedMonth }) => {
  const filteredDates = useMemo(() => {
    return dates.filter(date => isDateInMonth(date, selectedYear, selectedMonth));
  }, [dates, selectedYear, selectedMonth]);

  return (
    <thead>
      <tr>
        <HeaderCell isFirst>MUNICIPALITY</HeaderCell>
        {filteredDates.map(date => (
          <HeaderCell key={date}>{formatDate(date)}</HeaderCell>
        ))}
      </tr>
    </thead>
  );
});

// Memoized district header component
const DistrictHeader = memo(({ district, colSpan }) => (
                <tr>
                  <td
      colSpan={colSpan}
      className="fw-bold position-sticky start-0"
                    style={{ 
        padding: '0.75rem 1rem',
        fontSize: '1.1rem',
        zIndex: 1,
        backgroundColor: '#0dcaf0',
        color: 'white',
        height: '45px'
      }}
    >
      {district}
                  </td>
                </tr>
));

// Memoized data input cell component
const DataInputCell = memo(({ value, onChange, isEditMode }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '' || (Number(val) >= 0 && Number(val) <= 150)) {
      onChange(e);
    }
  };

  return (
    <td className="text-center align-middle p-2" style={{ height: '45px', minWidth: '180px' }}>
      {isEditMode ? (
        <input
          type="number"
          value={value === null ? '' : value}
          onChange={handleChange}
          min={0}
          max={150}
          className="form-control text-center fw-medium mx-auto"
                style={{ 
            width: '100px',
                  backgroundColor: '#ffffff',
            border: '1px solid #ced4da',
            color: '#000000',
            fontSize: '1rem',
            height: '35px',
            padding: '4px 8px',
            display: 'inline-block',
            boxShadow: 'none',
            borderRadius: '4px'
          }}
        />
      ) : (
        <span className="fw-medium">{value === null ? '-' : value}</span>
      )}
                  </td>
  );
});

// Memoized status cell component
const StatusCell = memo(({ value }) => {
  if (value === null) return <td className="text-center align-middle" style={{ height: '45px', minWidth: '180px' }}>-</td>;
  
  const isActive = value >= 5;
  const bgClass = isActive ? 'bg-success' : 'bg-danger';
  
  return (
    <td 
      className={`text-center align-middle text-white fw-bold ${bgClass}`}
      style={{ height: '45px', minWidth: '180px' }}
    >
      {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </td>
  );
});

// Memoized municipality row component
const MunicipalityRow = memo(({ 
  municipality, 
  district, 
  dates, 
  reportsData, 
  isStatus, 
  onInputChange, 
  isEditMode 
}) => (
  <tr>
    <td 
      className="position-sticky start-0 bg-white fw-medium border-end"
                      style={{ 
        zIndex: 1,
        padding: '0.75rem 1rem',
        height: '45px',
        minWidth: '200px'
      }}
    >
      {municipality}
                    </td>
    {dates.map(date => {
      const value = reportsData[date]?.[district]?.[municipality];
      return isStatus ? (
        <StatusCell key={date} value={value} />
      ) : (
        <DataInputCell
          key={date}
          value={value}
          onChange={(e) => onInputChange(date, district, municipality, e.target.value)}
          isEditMode={isEditMode}
        />
      );
    })}
                  </tr>
));

// Memoized district section component
const DistrictSection = memo(({ 
  district, 
  municipalities, 
  dates, 
  reportsData, 
  isStatus, 
  onInputChange, 
  isEditMode 
}) => (
  <>
    <DistrictHeader district={district} colSpan={dates.length + 1} />
    {Object.keys(municipalities).map(municipality => (
      <MunicipalityRow
        key={municipality}
        municipality={municipality}
        district={district}
        dates={dates}
        reportsData={reportsData}
        isStatus={isStatus}
        onInputChange={onInputChange}
        isEditMode={isEditMode}
      />
    ))}
  </>
));

// Memoized table component
const ReportTable = memo(({ 
  dates, 
  reportsData, 
  isStatus, 
  onInputChange,
  isEditMode,
  selectedYear,
  selectedMonth
}) => (
  <div className="table-responsive mt-3" style={{ 
    maxHeight: 'calc(100vh - 250px)',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }}>
    <Table bordered hover size="sm" className="table-sticky mb-0">
      <TableHeader 
        dates={dates} 
        selectedYear={selectedYear} 
        selectedMonth={selectedMonth}
      />
      <tbody>
        {Object.entries(reportsData?.[dates[0]] || {}).map(([district, municipalities]) => (
          <DistrictSection
            key={district}
            district={district}
            municipalities={municipalities}
            dates={dates}
            reportsData={reportsData}
            isStatus={isStatus}
            onInputChange={onInputChange}
            isEditMode={isEditMode}
          />
            ))}
          </tbody>
        </Table>
      </div>
));

// Memoized year/month selector component
const PeriodSelector = memo(({ 
  selectedYear, 
  selectedMonth, 
  years, 
  months, 
  onYearChange, 
  onMonthChange 
}) => (
  <Row className="mb-4 g-3">
    <Col xs={12} sm={6} md={3}>
      <Form.Group>
        <Form.Label className="fw-medium">Year</Form.Label>
        <Form.Select
          value={selectedYear}
          onChange={onYearChange}
          className="fw-medium"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>
      </Form.Group>
    </Col>
    <Col xs={12} sm={6} md={3}>
      <Form.Group>
        <Form.Label className="fw-medium">Month</Form.Label>
        <Form.Select
          value={selectedMonth}
          onChange={onMonthChange}
          className="fw-medium"
        >
          {months.map(month => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </Col>
  </Row>
));

const DateRangeDisplay = memo(({ dateRange }) => (
  <Card className="mb-4 border-0 shadow-sm date-range-card">
    <Card.Body className="d-flex align-items-center py-3">
      <div className="calendar-icon-wrapper">
        <CalendarIcon className="text-primary" style={{ fontSize: '2rem' }} />
      </div>
      <div>
        <h6 className="mb-1 text-muted fw-normal">Current Date Range</h6>
        <h5 className="mb-0 text-primary fw-bold">
          {dateRange.start} - {dateRange.end}
        </h5>
      </div>
    </Card.Body>
  </Card>
));

const IPatroller = () => {
  const [activeTab, setActiveTab] = useState('status'); // Changed default to 'status'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [editedData, setEditedData] = useState({});
  const [localData, setLocalData] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [isEditMode, setIsEditMode] = useState(false);

  const queryClient = useQueryClient();

  // Generate year options (2025-2027)
  const years = useMemo(() => {
    return [2025, 2026, 2027];
  }, []);

  // Generate month options
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
    }));
  }, []);

  // Get the date range for the selected month with precise date handling
  const dateRange = useMemo(() => {
    // Set time to noon to avoid timezone issues
    const startDate = new Date(selectedYear, selectedMonth - 1, 1, 12, 0, 0);
    const endDate = new Date(selectedYear, selectedMonth, 0, 12, 0, 0);
    
    const formatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    };

    // Ensure we're working with UTC dates
    const start = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
    const end = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);

    return {
      start: start.toLocaleDateString('en-US', formatOptions),
      end: end.toLocaleDateString('en-US', formatOptions),
      monthYear: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [selectedYear, selectedMonth]);

  // Fetch data with optimized caching
  const { data: reportsData, error, refetch } = useQuery({
    queryKey: ['monthlyReports', selectedYear, selectedMonth],
    queryFn: () => patrollerService.getMonthlyReports(selectedYear, selectedMonth),
    staleTime: 30000,
    cacheTime: 3600000,
    keepPreviousData: true,
    refetchOnWindowFocus: false
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Convert the data structure to match batchUpdateCounts format
      const updates = [];
      Object.entries(data).forEach(([date, districts]) => {
        Object.entries(districts).forEach(([district, municipalities]) => {
          Object.entries(municipalities).forEach(([municipality, count]) => {
            // Only include changed values
            if (count !== reportsData?.[date]?.[district]?.[municipality]) {
              updates.push({
                date,
                district,
                municipality,
                count
              });
            }
          });
        });
      });
      return patrollerService.batchUpdateCounts(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['monthlyReports', selectedYear, selectedMonth]);
      setToast({
        show: true,
        message: 'Data saved successfully!',
        variant: 'success'
      });
      setEditedData({});
      setIsEditMode(false);
    },
    onError: (error) => {
      setToast({
        show: true,
        message: error.message || 'Failed to save data. Please try again.',
        variant: 'danger'
      });
    }
  });

  // Get sorted dates for the current month only with precise date handling
  const dates = useMemo(() => {
    if (!reportsData) return [];
    
    // Get all dates and filter strictly
    return Object.keys(reportsData)
      .filter(dateStr => isDateInMonth(dateStr, selectedYear, selectedMonth))
      .sort((a, b) => new Date(a) - new Date(b));
  }, [reportsData, selectedYear, selectedMonth]);

  // Combine reportsData with localData for display
  const displayData = useMemo(() => {
    if (!reportsData) return {};
    
    // Create a clean copy without lastUpdated and filter dates
    const cleanData = {};
    Object.entries(reportsData).forEach(([date, data]) => {
      if (isDateInMonth(date, selectedYear, selectedMonth)) {
        const { lastUpdated, ...rest } = data;
        cleanData[date] = rest;
      }
    });
    
    // Overlay local changes
    Object.entries(localData).forEach(([date, districts]) => {
      if (isDateInMonth(date, selectedYear, selectedMonth)) {
        if (!cleanData[date]) cleanData[date] = {};
        Object.entries(districts).forEach(([district, municipalities]) => {
          if (!cleanData[date][district]) cleanData[date][district] = {};
          Object.entries(municipalities).forEach(([municipality, value]) => {
            cleanData[date][district][municipality] = value;
          });
        });
      }
    });
    
    return cleanData;
  }, [reportsData, localData, selectedYear, selectedMonth]);

  const handleInputChange = useCallback((date, district, municipality, value) => {
    const numValue = value === '' ? null : Number(value);
    
    // Don't update if value is greater than 150
    if (numValue !== null && numValue > 150) return;

    // Update local state immediately for instant feedback
    setLocalData(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [district]: {
          ...(prev[date]?.[district] || {}),
          [municipality]: numValue
        }
      }
    }));

    // Update edited data for saving
    setEditedData(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [district]: {
          ...(prev[date]?.[district] || {}),
          [municipality]: numValue
        }
      }
    }));
  }, []);

  const handleSave = useCallback(() => {
    const updatedData = {};
    Object.entries(editedData).forEach(([date, districts]) => {
      if (!updatedData[date]) updatedData[date] = {};
      Object.entries(districts).forEach(([district, municipalities]) => {
        if (!updatedData[date][district]) updatedData[date][district] = {};
        Object.entries(municipalities).forEach(([municipality, value]) => {
          updatedData[date][district][municipality] = value;
        });
      });
    });
    saveMutation.mutate(updatedData);
    setIsEditMode(false); // Disable edit mode after saving
  }, [editedData, saveMutation]);

  if (error) {
    return (
      <Container fluid className="py-4">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Failed to load reports</h4>
          <p>{error.message}</p>
          <Button variant="outline-danger" onClick={refetch}>Retry</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <ToastContainer 
        className="p-3 position-fixed" 
        style={{ 
          zIndex: 9999, 
          top: 20, 
          left: '50%', 
          transform: 'translateX(-50%)'
        }}
      >
        <Toast 
          show={toast.show} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          delay={3000}
          autohide
          bg={toast.variant}
          className="text-white text-center"
        >
          <Toast.Body className="py-3 px-4" style={{ fontSize: '1rem', fontWeight: 500 }}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="text-primary border-bottom border-primary pb-2 d-inline-block">
            IPatroller Reports
          </h4>
          <p className="text-muted mt-2 mb-0">
            Monthly report for {dateRange.monthYear}
          </p>
        </div>
        {activeTab === 'daily' && (
          <div className="d-flex gap-2">
            {isEditMode ? (
              <Button 
                variant="success"
                onClick={handleSave}
                disabled={Object.keys(editedData).length === 0 || saveMutation.isLoading}
                className="px-4"
              >
                {saveMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            ) : (
              <Button 
                variant="primary"
                onClick={() => setIsEditMode(true)}
                className="px-4"
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      <DateRangeDisplay dateRange={dateRange} />

      <PeriodSelector
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        years={years}
        months={months}
        onYearChange={(e) => setSelectedYear(Number(e.target.value))}
        onMonthChange={(e) => setSelectedMonth(Number(e.target.value))}
      />

      <Nav variant="tabs" className="mb-3 border-bottom border-primary">
              <Nav.Item>
                <Nav.Link 
            active={activeTab === 'status'} 
            onClick={() => {
              setActiveTab('status');
              setIsEditMode(false);
            }}
                  className="px-4 py-2"
                >
                  IPatroller Status
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
            active={activeTab === 'daily'} 
            onClick={() => {
              setActiveTab('daily');
              setIsEditMode(false);
            }}
                  className="px-4 py-2"
                >
            Daily Reports
                </Nav.Link>
              </Nav.Item>
            </Nav>

      {activeTab === 'status' ? (
        <ReportTable
          dates={dates}
          reportsData={displayData}
          isStatus={true}
          onInputChange={handleInputChange}
          isEditMode={false}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      ) : (
        <div>
          <ReportTable
            dates={dates}
            reportsData={displayData}
            isStatus={false}
            onInputChange={handleInputChange}
            isEditMode={isEditMode}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
            </div>
      )}

      <style>
        {`
          .table-sticky thead th {
            position: sticky;
            top: 0;
            z-index: 2;
            background-color: #0d6efd;
          }
          
          .table-sticky td:first-child,
          .table-sticky th:first-child {
            position: sticky;
            left: 0;
            z-index: 1;
          }

          .table-sticky thead th:first-child {
            z-index: 3;
          }

          .table-responsive {
            scrollbar-width: thin;
            scrollbar-color: #6c757d #f8f9fa;
          }

          .table-responsive::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }

          .table-responsive::-webkit-scrollbar-track {
            background: #f8f9fa;
            border-radius: 5px;
          }

          .table-responsive::-webkit-scrollbar-thumb {
            background-color: #6c757d;
            border-radius: 5px;
            border: 2px solid #f8f9fa;
          }

          .table-responsive::-webkit-scrollbar-corner {
            background: #f8f9fa;
          }

          tr:hover td {
            background-color: rgba(0,0,0,0.05);
          }

          tr:hover td:first-child {
            background-color: white;
          }

          .table td, .table th {
            vertical-align: middle;
            white-space: nowrap;
          }

          .table-bordered > :not(caption) > * > * {
            border-width: 1px;
            border-color: #dee2e6;
          }

          .form-control:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          }

          .nav-tabs .nav-link {
            color: #6c757d;
          }

          .nav-tabs .nav-link.active {
            color: #0d6efd;
            font-weight: 500;
          }

          .nav-tabs .nav-link:hover {
            border-color: #e9ecef #e9ecef #dee2e6;
            isolation: isolate;
          }

          /* Add styles for number input */
          input[type="number"] {
            -moz-appearance: textfield !important;
            appearance: textfield !important;
          }

          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
          }

          input[type="number"] {
            border: 1px solid #ced4da !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 1rem !important;
            height: 35px !important;
            padding: 4px 8px !important;
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          input[type="number"]:focus {
            border-color: #0d6efd !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
            outline: none !important;
          }

          .toast {
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .toast.bg-success {
            background-color: #198754 !important;
          }

          .toast.bg-danger {
            background-color: #dc3545 !important;
          }

          .btn {
            font-weight: 500;
            height: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .btn-success {
            background-color: #198754;
            border-color: #198754;
          }

          .btn-success:hover {
            background-color: #157347;
            border-color: #146c43;
          }

          .btn:disabled {
            opacity: 0.65;
          }

          .gap-2 {
            gap: 0.5rem;
          }

          /* Date Range Card Styles */
          .date-range-card {
            background: linear-gradient(to right, #f8f9fa, #ffffff);
            border-radius: 12px;
            transition: all 0.3s ease;
          }

          .date-range-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          }

          .calendar-icon-wrapper {
            background-color: rgba(13, 110, 253, 0.1);
            padding: 12px;
            border-radius: 50%;
            margin-right: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .date-range-card h5 {
            font-size: 1.25rem;
            letter-spacing: -0.5px;
          }

          .date-range-card h6 {
            font-size: 0.875rem;
            opacity: 0.8;
          }
        `}
      </style>
    </Container>
  );
};

export default memo(IPatroller); 