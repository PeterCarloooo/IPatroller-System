import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Chart as ChartJS } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Reports() {
  const printRef = useRef();
  const chartRef = useRef();
  const [chartData, setChartData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [activeInactiveData, setActiveInactiveData] = useState([]);
  const [period, setPeriod] = useState('monthly'); // 'monthly' or 'quarterly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const today = new Date();
    const q = Math.floor(today.getMonth() / 3) + 1;
    return `${today.getFullYear()}-Q${q}`;
  });
  const [printSections, setPrintSections] = useState({
    summary: true,
    analytics: true,
    total: true,
    all: true,
  });
  const [granularity, setGranularity] = useState('quarterly'); // 'monthly', 'quarterly'

  // Dynamic summary state
  const [summaryStats, setSummaryStats] = useState({
    commandCenter: 0, // unique municipalities with patrols
    patrollersOnDuty: 0, // total active patrollers (count >= 5)
    incidents: 0, // incident reports in period
  });

  // Generate months for the selected year
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return {
      value: `${selectedYear}-${month}`,
      label: new Date(`${selectedYear}-${month}-01`).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    };
  });

  // Generate quarters for the selected year
  const quarters = [1, 2, 3, 4].map(q => ({
    value: `${selectedYear}-Q${q}`,
    label: `Q${q} ${selectedYear}`,
  }));

  const handleSectionChange = (section) => {
    if (section === 'all') {
      // If 'all' is checked, check all sections. If unchecked, uncheck all sections.
      if (!printSections.all) {
        setPrintSections({ summary: true, analytics: true, total: true, all: true });
      } else {
        setPrintSections({ summary: false, analytics: false, total: false, all: false });
      }
    } else {
      const updated = { ...printSections, [section]: !printSections[section] };
      // If any section is unchecked, 'all' should be false
      updated.all = updated.summary && updated.analytics && updated.total;
      setPrintSections(updated);
    }
  };

  useEffect(() => {
    async function fetchData() {
      let q;
      if (period === 'monthly') {
        q = query(collection(db, 'daily_counts'), where('month', '==', selectedMonth));
      } else {
        // For quarterly, dynamically get months in the selected quarter
        const [year, qStr] = selectedQuarter.split('-Q');
        const quarter = parseInt(qStr, 10);
        const startMonth = (quarter - 1) * 3 + 1;
        const monthsInQuarter = [0, 1, 2].map(i => `${year}-${String(startMonth + i).padStart(2, '0')}`);
        q = query(collection(db, 'daily_counts'), where('month', 'in', monthsInQuarter));
      }
      const snapshot = await getDocs(q);

      // Granularity logic
      let chartLabels = [];
      let chartActive = [];
      let chartInactive = [];
      let tableData = [];
      if (granularity === 'monthly') {
        // Per Month for selected year or quarter
        const monthStats = {};
        snapshot.forEach(doc => {
          const { month, count } = doc.data();
          if (!monthStats[month]) monthStats[month] = { active: 0, inactive: 0 };
          if (count >= 5) {
            monthStats[month].active += count;
          } else {
            monthStats[month].inactive += count;
          }
        });
        // Sort months by calendar order
        const allMonths = months.map(m => m.value);
        chartLabels = allMonths.filter(m => monthStats[m]).map(m => {
          const date = new Date(m + '-01');
          return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        });
        const sortedMonthKeys = allMonths.filter(m => monthStats[m]);
        chartActive = sortedMonthKeys.map(month => monthStats[month].active);
        chartInactive = sortedMonthKeys.map(month => monthStats[month].inactive);
        tableData = sortedMonthKeys.map(month => ({
          name: new Date(month + '-01').toLocaleString('en-US', { month: 'short', year: '2-digit' }),
          active: monthStats[month].active,
          inactive: monthStats[month].inactive
        }));
      } else {
        // Quarterly (default, by municipality)
        const muniStats = {};
        snapshot.forEach(doc => {
          const { municipality, count } = doc.data();
          if (!muniStats[municipality]) muniStats[municipality] = { active: 0, inactive: 0 };
          if (count >= 5) {
            muniStats[municipality].active += count;
          } else {
            muniStats[municipality].inactive += count;
          }
        });
        // Sort municipalities alphabetically
        chartLabels = Object.keys(muniStats).sort((a, b) => a.localeCompare(b));
        chartActive = chartLabels.map(muni => muniStats[muni].active);
        chartInactive = chartLabels.map(muni => muniStats[muni].inactive);
        tableData = chartLabels.map(muni => ({ name: muni, active: muniStats[muni].active, inactive: muniStats[muni].inactive }));
      }
      // If no data, show a message
      if (chartLabels.length === 0) {
        setChartData(null);
        setActiveInactiveData([]);
      } else {
        setChartData({
          labels: chartLabels,
          datasets: [
            {
              label: 'Active',
              data: chartActive,
              backgroundColor: 'rgba(37, 199, 100, 0.7)',
            },
            {
              label: 'Inactive',
              data: chartInactive,
              backgroundColor: 'rgba(235, 99, 37, 0.7)',
            },
          ],
        });
        setActiveInactiveData(tableData);
      }
      // Sort tableData alphabetically by name
      tableData = tableData.sort((a, b) => a.name.localeCompare(b.name));

      // Show top 12 municipalities in Area Insights, sorted by count descending
      const sorted = tableData
        .map(({ name, active, inactive }) => ({ name, count: active + inactive }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
      setInsights(sorted);

      // --- SUMMARY CALCULATION ---
      // Command Center: unique municipalities with patrols
      const muniSet = new Set();
      let patrollersOnDuty = 0;
      snapshot.forEach(doc => {
        const { municipality, count } = doc.data();
        if (municipality) muniSet.add(municipality);
        if (typeof count === 'number' && count >= 5) patrollersOnDuty += count;
      });
      // Incidents: count from incidents collection for the period
      let incidentsCount = 0;
      if (period === 'monthly') {
        const incQ = query(collection(db, 'incidents'), where('date', '>=', `${selectedMonth}-01`), where('date', '<=', `${selectedMonth}-31`));
        const incSnap = await getDocs(incQ);
        incidentsCount = incSnap.size;
      } else {
        // Quarterly: get all months in quarter
        const [year, qStr] = selectedQuarter.split('-Q');
        const quarter = parseInt(qStr, 10);
        const startMonth = (quarter - 1) * 3 + 1;
        const monthsInQuarter = [0, 1, 2].map(i => `${year}-${String(startMonth + i).padStart(2, '0')}`);
        // Get all dates in quarter
        const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(startMonth+2).padStart(2, '0')}-31`;
        const incQ = query(collection(db, 'incidents'), where('date', '>=', startDate), where('date', '<=', endDate));
        const incSnap = await getDocs(incQ);
        incidentsCount = incSnap.size;
      }
      setSummaryStats({
        commandCenter: muniSet.size,
        patrollersOnDuty,
        incidents: incidentsCount,
      });
    }
    fetchData();
  }, [period, selectedMonth, selectedQuarter, granularity]);

  const handlePrint = () => {
    let printContents = '';
    if (printSections.all || printSections.summary) {
      const summaryDiv = document.getElementById('print-summary');
      if (summaryDiv) printContents += summaryDiv.outerHTML;
    }
    if (printSections.all || printSections.analytics) {
      const analyticsDiv = document.getElementById('print-analytics');
      if (analyticsDiv) printContents += analyticsDiv.outerHTML;
    }
    if (printSections.all || printSections.total) {
      const totalDiv = document.getElementById('print-total');
      if (totalDiv) printContents += totalDiv.outerHTML;
    }
    // Insert chart image if available
    let chartImgHtml = '';
    if (chartRef.current && chartRef.current instanceof ChartJS) {
      const chartInstance = chartRef.current;
      const imgData = chartInstance.toBase64Image();
      chartImgHtml = `<div style="text-align:center;margin-bottom:2rem;"><img src='${imgData}' style='max-width:100%;height:auto;border-radius:8px;border:1px solid #eee;'/></div>`;
    } else if (chartRef.current && chartRef.current.chartInstance) {
      // For react-chartjs-2 v2/v3 compatibility
      const imgData = chartRef.current.chartInstance.toBase64Image();
      chartImgHtml = `<div style="text-align:center;margin-bottom:2rem;"><img src='${imgData}' style='max-width:100%;height:auto;border-radius:8px;border:1px solid #eee;'/></div>`;
    }
    // Replace the chart container in printContents with the image
    printContents = printContents.replace(
      /(<div class=\"d-flex justify-content-center align-items-center mb-4\"[^>]*>)([\s\S]*?)(<\/div>)/,
      `$1${chartImgHtml}$3`
    );
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Report</title>');
    win.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />');
    win.document.write(`
      <style>
        @media print {
          body { background: #fff !important; }
          .sidebar, .navbar, .main-content > nav, .main-content > .top-navbar, .main-content > .sidebar { display: none !important; }
          .container { max-width: 100% !important; }
          .card, .shadow-sm, .border-0 { box-shadow: none !important; border: none !important; }
          .row, .col-12, .col-md-4, .col-lg-8, .col-lg-4 { float: none !important; width: 100% !important; display: block !important; }
          .d-flex, .align-items-center, .justify-content-between, .justify-content-center { display: block !important; }
          .mb-4, .mb-5, .mt-4, .mt-3, .mb-3 { margin: 1rem 0 !important; }
          .table { width: 100% !important; font-size: 1rem; border-collapse: collapse !important; margin-bottom: 2rem !important; }
          .table th, .table td { border: 1px solid #ccc !important; padding: 8px 12px !important; text-align: left; }
          .list-group-item { font-size: 1rem; border: 1px solid #ccc !important; }
          .print-header { text-align: center; margin-bottom: 2rem; }
          h2, h4, h5 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
          .summary-table th, .summary-table td { text-align: center; }
        }
        .print-header { text-align: center; margin-bottom: 2rem; }
      </style>
    `);
    win.document.write('</head><body>');
    win.document.write(`<div class="print-header">
      <h1>Patroller System Report</h1>
      <div><strong>Period:</strong> ${period === 'monthly' ? months.find(m => m.value === selectedMonth)?.label : quarters.find(q => q.value === selectedQuarter)?.label}</div>
      <div><strong>Generated:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</div>
    </div>`);
    win.document.write('<div class="container py-5">');
    win.document.write(printContents);
    win.document.write('</div></body></html>');
    win.document.close();
    win.print();
  };

  return (
    <DashboardLayout activePage="reports">
      <div className="container-fluid py-4" style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div ref={printRef} className="w-100">
          {/* Report Generation */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm p-4 border-0 text-center">
                <h2 className="fw-bold mb-2">Report Generation</h2>
                <p className="text-muted mb-4" style={{fontSize: '1.1rem'}}>
                  Select which parts of the report you want to print or export. Adjust the period and date range as needed. Hover over the info icons for details about each section.
                </p>
                <div className="mb-3 d-flex flex-wrap justify-content-center gap-3 align-items-center">
                  <div className="form-check form-check-inline" title="Print or export the entire report, including all sections.">
                    <input className="form-check-input" type="checkbox" id="printAll" checked={printSections.all} onChange={() => handleSectionChange('all')} />
                    <label className="form-check-label" htmlFor="printAll">All <i className="fas fa-info-circle text-secondary ms-1" /></label>
                  </div>
                  <div className="form-check form-check-inline" title="Summary cards showing key statistics.">
                    <input className="form-check-input" type="checkbox" id="printSummary" checked={printSections.summary} disabled={printSections.all} onChange={() => handleSectionChange('summary')} />
                    <label className="form-check-label" htmlFor="printSummary">Summary Cards <i className="fas fa-info-circle text-secondary ms-1" /></label>
                  </div>
                  <div className="form-check form-check-inline" title="Charts and analytics for the selected period.">
                    <input className="form-check-input" type="checkbox" id="printAnalytics" checked={printSections.analytics} disabled={printSections.all} onChange={() => handleSectionChange('analytics')} />
                    <label className="form-check-label" htmlFor="printAnalytics">Data Analytics <i className="fas fa-info-circle text-secondary ms-1" /></label>
                  </div>
                  <div className="form-check form-check-inline" title="List of totals per municipality.">
                    <input className="form-check-input" type="checkbox" id="printTotal" checked={printSections.total} disabled={printSections.all} onChange={() => handleSectionChange('total')} />
                    <label className="form-check-label" htmlFor="printTotal">Total Per Municipality <i className="fas fa-info-circle text-secondary ms-1" /></label>
                  </div>
                </div>
                <div className="row mb-3 justify-content-center align-items-center g-2">
                  <div className="col-auto">
                    <select className="form-select w-auto" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} aria-label="Select year">
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                  <div className="col-auto">
                    <select className="form-select w-auto" value={period} onChange={e => setPeriod(e.target.value)} aria-label="Select period">
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  <div className="col-auto">
                    {period === 'monthly' ? (
                      <select className="form-select w-auto" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} aria-label="Select month">
                        {months.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    ) : (
                      <select className="form-select w-auto" value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)} aria-label="Select quarter">
                        {quarters.map(q => (
                          <option key={q.value} value={q.value}>{q.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <button className="btn btn-success" onClick={handlePrint}>
                    <i className="fas fa-print me-2"></i> Print Report
                  </button>
                  {/* Export buttons will be added in the next step */}
                </div>
                <div className="mt-3">
                  <p className="mb-0">
                    <strong>Note:</strong> Piliin kung anong bahagi ng report ang ipiprint. Default ay All.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Tile Layout for Report Sections */}
          <div className="row g-4 mb-4" style={{ minHeight: '60vh' }}>
            <div className="col-12 col-lg-9 d-flex order-lg-1">
              <div id="print-analytics" className="flex-fill h-100 ps-4 pe-2 bg-white rounded-4 shadow-lg d-flex flex-column justify-content-between border border-2 border-success-subtle" style={{ minHeight: 480 }}>
                <div className="d-flex flex-wrap align-items-center mb-2 gap-3">
                  <h2 className="fw-bold text-success text-start mb-0" style={{fontSize: '2rem', letterSpacing: '0.5px'}}>Data Analytics</h2>
                  <select className="form-select w-auto" value={granularity} onChange={e => setGranularity(e.target.value)}>
                    <option value="monthly">Per Month</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                  {granularity === 'monthly' && (
                    <select className="form-select w-auto" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                      {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  )}
                  {granularity === 'quarterly' && (
                    <select className="form-select w-auto" value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)}>
                      {quarters.map(q => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                  )}
                </div>
                <hr className="mb-3 mt-2" style={{ borderTop: '2px solid #e0f2f1' }} />
                <p className="text-muted mb-4 text-start" style={{fontSize: '1.1rem'}}>
                  Visual representation and breakdown of patrol counts per municipality for the selected period.
                </p>
                <div className="d-flex justify-content-center align-items-center mb-4" style={{minHeight: 340, width: '100%'}}>
                  {chartData ? (
                    <Bar ref={chartRef} data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} height={320} width={800} />
                  ) : (
                    <div className="text-center w-100 py-5 text-muted">No data available for the selected period.</div>
                  )}
                </div>
                <h5 className="fw-bold mb-3 text-info text-start" style={{fontSize: '1.2rem'}}>
                  {granularity === 'monthly' ? 'Active/Inactive Per Month' : 'Active/Inactive Per Municipality'}
                </h5>
                <div className="table-responsive mb-2">
                  <table className="table table-striped table-hover align-middle mb-0 border rounded-3 overflow-hidden">
                    <thead className="table-info">
                      <tr>
                        <th className="text-info">Municipality</th>
                        <th className="text-success">Active</th>
                        <th className="text-danger">Inactive</th>
                        <th className="text-success">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const grandTotal = activeInactiveData.reduce((sum, { active, inactive }) => sum + active + inactive, 0);
                        return activeInactiveData.map(({ name, active, inactive }) => {
                          const total = active + inactive;
                          const percentOfGrand = grandTotal ? ((total / grandTotal) * 100).toFixed(1) : 0;
                          return (
                            <tr key={name}>
                              <td>{name}</td>
                              <td className="fw-bold text-center text-success">{active}</td>
                              <td className="fw-bold text-center text-danger">{inactive}</td>
                              <td className="fw-semibold text-center">{percentOfGrand}%</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-3 order-lg-2 d-flex flex-column justify-content-between" style={{gap: '1.5rem', minHeight: 480}}>
              <div className="flex-fill d-flex flex-column justify-content-between" style={{height: '50%'}}>
                <div id="print-total" className="p-4 bg-white rounded-4 shadow-sm border border-2 border-warning-subtle d-flex flex-column justify-content-between h-100">
                  <h2 className="fw-bold mb-3 text-warning text-start" style={{fontSize: '1.5rem', letterSpacing: '0.5px', borderBottom: '2px solid #fff3cd', paddingBottom: 6}}>Total Per Municipality</h2>
                  <p className="text-muted mb-4 text-start" style={{fontSize: '1.05rem'}}>
                    List of all municipalities and their total patrol counts for the selected period.
                  </p>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle mb-0 border rounded-3 overflow-hidden">
                      <thead className="table-warning">
                        <tr>
                          <th className="text-warning">Municipality</th>
                          <th className="text-warning">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {insights.map((insight, idx) => (
                          <tr key={idx}>
                            <td>{insight.name}</td>
                            <td className="fw-bold text-center">{insight.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="flex-fill d-flex flex-column justify-content-between" style={{height: '50%'}}>
                <div id="print-summary" className="p-4 bg-white rounded-4 shadow-sm border border-2 border-primary-subtle d-flex flex-column justify-content-between h-100">
                  <h2 className="fw-bold mb-3 text-primary text-start" style={{fontSize: '1.5rem', letterSpacing: '0.5px', borderBottom: '2px solid #cfe2ff', paddingBottom: 6}}>Summary</h2>
                  <p className="text-muted mb-4 text-start" style={{fontSize: '1.05rem'}}>
                    Key statistics for the selected period, including active operations, patrollers on duty, and incidents today.
                  </p>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover summary-table align-middle mb-0 border rounded-3 overflow-hidden">
                      <thead className="table-primary">
                        <tr>
                          <th className="text-primary">Section</th>
                          <th className="text-primary">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Command Center</td>
                          <td className="fs-5 fw-bold text-center">{summaryStats.commandCenter}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">IPatroller Status</td>
                          <td className="fs-5 fw-bold text-center">{summaryStats.patrollersOnDuty}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Incidents</td>
                          <td className="fs-5 fw-bold text-center">{summaryStats.incidents}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 