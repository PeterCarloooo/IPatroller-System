import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Table, Badge, Stack, Nav, Form } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useIPatrollerData } from '../context/IPatrollerContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Reports() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const quarter = Math.ceil(currentMonth / 3);
    return `${currentYear}-Q${quarter}`;
  });
  const [printSections, setPrintSections] = useState({
    all: true,
    summary: false,
    analytics: false,
    total: false,
    quarterly: false
  });
  const chartRef = useRef();

  // Get IPatroller data from context
  const {
    loading,
    selectedMonth,
    setSelectedMonth,
    getCurrentMonthData,
    getStatusData,
    getSummaryStats,
    getDateHeaders,
    availableMonths,
    allData
  } = useIPatrollerData();

  // Generate available quarters
  const getAvailableQuarters = () => {
    const quarters = [];
    const currentYear = new Date().getFullYear();
    
    // Generate quarters for the last 2 years
    for (let year = currentYear - 1; year <= currentYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        quarters.push(`${year}-Q${quarter}`);
      }
    }
    
    return quarters.reverse();
  };

  const availableQuarters = getAvailableQuarters();

  // Get quarterly data
  const getQuarterlyData = (quarter) => {
    const [year, quarterNum] = quarter.split('-Q');
    const quarterStartMonth = (parseInt(quarterNum) - 1) * 3 + 1;
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
    
    const quarterlyData = {};
    let totalActiveDays = 0;
    let totalInactiveDays = 0;
    let totalPatrollers = 0;
    let totalDays = 0;

    // Process each month in the quarter
    for (let month = quarterStartMonth; month < quarterStartMonth + 3; month++) {
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const monthData = allData[monthKey] || {};
      
      municipalities.forEach(muni => {
        if (!quarterlyData[muni]) {
          quarterlyData[muni] = {
            totalPatrollers: 0,
            activeDays: 0,
            inactiveDays: 0,
            totalDays: 0,
            monthlyData: {}
          };
        }
        
        const counts = monthData[muni] || [];
        const monthTotal = counts.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
        const activeDays = counts.filter(count => parseInt(count) >= 5).length;
        const inactiveDays = counts.filter(count => parseInt(count) < 5 && parseInt(count) > 0).length;
        
        quarterlyData[muni].totalPatrollers += monthTotal;
        quarterlyData[muni].activeDays += activeDays;
        quarterlyData[muni].inactiveDays += inactiveDays;
        quarterlyData[muni].totalDays += counts.length;
        quarterlyData[muni].monthlyData[monthKey] = {
          total: monthTotal,
          activeDays,
          inactiveDays,
          days: counts.length
        };
        
        totalPatrollers += monthTotal;
        totalActiveDays += activeDays;
        totalInactiveDays += inactiveDays;
        totalDays += counts.length;
      });
    }

    return {
      municipalities: quarterlyData,
      summary: {
        totalPatrollers,
        totalActiveDays,
        totalInactiveDays,
        totalDays,
        activePercentage: totalDays > 0 ? (totalActiveDays / totalDays) * 100 : 0,
        inactivePercentage: totalDays > 0 ? (totalInactiveDays / totalDays) * 100 : 0
      }
    };
  };

  const quarterlyData = getQuarterlyData(selectedQuarter);

  // Calculate quarterly chart data
  const getQuarterlyChartData = () => {
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
    const data = quarterlyData.municipalities;
    
    const activeDaysData = municipalities.map(muni => data[muni]?.activeDays || 0);
    const inactiveDaysData = municipalities.map(muni => data[muni]?.inactiveDays || 0);
    const totalPatrollersData = municipalities.map(muni => data[muni]?.totalPatrollers || 0);

    return {
      labels: municipalities,
      datasets: [
        {
          label: 'Active Days',
          data: activeDaysData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        },
        {
          label: 'Inactive Days',
          data: inactiveDaysData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        },
        {
          label: 'Total Patrollers',
          data: totalPatrollersData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const quarterlyChartData = getQuarterlyChartData();

  const quarterlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Quarterly Patroller Status (${selectedQuarter})`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Calculate real data for chart using IPatroller data
  const getChartData = () => {
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
    const currentData = getCurrentMonthData();
    const statusData = getStatusData();
    
    const activeData = municipalities.map(muni => {
      return statusData[muni] === 'Active' ? 1 : 0;
    });

    const inactiveData = municipalities.map(muni => {
      return statusData[muni] === 'Inactive' ? 1 : 0;
    });

    const totalPatrollersData = municipalities.map(muni => {
      const counts = currentData[muni] || [];
      return counts.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
    });

    return {
      labels: municipalities,
      datasets: [
        {
          label: 'Active Municipalities',
          data: activeData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Inactive Municipalities',
          data: inactiveData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        },
        {
          label: 'Total Patrollers',
          data: totalPatrollersData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const chartData = getChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Patroller Status by Municipality'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            const total = this.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Calculate real data for municipality totals using IPatroller data
  const getTotalPerMunicipality = () => {
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
    const currentData = getCurrentMonthData();
    const statusData = getStatusData();
    
    return municipalities.map(muni => {
      const counts = currentData[muni] || [];
      const totalPatrollers = counts.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
      const isActive = statusData[muni] === 'Active';
      
      return {
        municipality: muni,
        totalPatrollers,
        isActive,
        status: statusData[muni],
        totalDays: counts.length,
        filledDays: counts.filter(count => count !== '' && count !== null && count !== undefined).length
      };
    }).filter(item => item.totalPatrollers > 0 || item.filledDays > 0); // Show municipalities with data
  };

  const totalPerMunicipality = getTotalPerMunicipality();

  // Calculate summary data using IPatroller data
  const getSummaryData = () => {
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
    const currentData = getCurrentMonthData();
    const statusData = getStatusData();
    
    let totalPatrollers = 0;
    let activeMunicipalities = 0;
    let inactiveMunicipalities = 0;
    
    municipalities.forEach(muni => {
      const counts = currentData[muni] || [];
      const muniPatrollers = counts.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
      totalPatrollers += muniPatrollers;
      
      if (statusData[muni] === 'Active') {
        activeMunicipalities++;
      } else {
        inactiveMunicipalities++;
      }
    });
    
    const totalDays = municipalities.length * 31; // Assuming 31 days
    const filledDays = municipalities.reduce((sum, muni) => {
      const counts = currentData[muni] || [];
      return sum + counts.filter(count => count > 0).length;
    }, 0);
    
    const completionRate = totalDays > 0 ? (filledDays / totalDays) * 100 : 0;
    const activePercentage = municipalities.length > 0 ? (activeMunicipalities / municipalities.length) * 100 : 0;
    
    return [
      {
        value: municipalities.length,
        label: 'Total Municipalities',
        color: 'primary',
        icon: 'fa-map-marker-alt'
      },
      {
        value: activeMunicipalities,
        label: 'Active Municipalities',
        color: 'success',
        icon: 'fa-check-circle'
      },
      {
        value: inactiveMunicipalities,
        label: 'Inactive Municipalities',
        color: 'danger',
        icon: 'fa-times-circle'
      },
      {
        value: totalPatrollers,
        label: 'Total Patrollers',
        color: 'info',
        icon: 'fa-users'
      },
      {
        value: `${completionRate.toFixed(1)}%`,
        label: 'Data Completion Rate',
        color: 'warning',
        icon: 'fa-chart-pie'
      },
      {
        value: `${activePercentage.toFixed(1)}%`,
        label: 'Active Percentage',
        color: 'success',
        icon: 'fa-percentage'
      }
    ];
  };

  const summaryData = getSummaryData();

  const handlePrint = () => {
    let printContents = '';
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Add report header
    printContents += `
      <div class="print-header" style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="margin: 0; color: #333; font-size: 24pt;">IPatroller System Report</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 12pt;">Generated on ${currentDate}</p>
      </div>
    `;
    
    if (printSections.all || printSections.summary) {
      const summaryDiv = document.getElementById('print-summary');
      if (summaryDiv) {
        printContents += '<div class="page-break"></div>';
        printContents += summaryDiv.outerHTML;
      }
    }
    
    if (printSections.all || printSections.analytics) {
      const analyticsDiv = document.getElementById('print-analytics');
      if (analyticsDiv) {
        printContents += '<div class="page-break"></div>';
        printContents += analyticsDiv.outerHTML;
      }
    }
    
    if (printSections.all || printSections.total) {
      const totalDiv = document.getElementById('print-total');
      if (totalDiv) {
        printContents += '<div class="page-break"></div>';
        printContents += totalDiv.outerHTML;
      }
    }
    
    if (printSections.all || printSections.quarterly) {
      const quarterlyDiv = document.getElementById('print-quarterly');
      if (quarterlyDiv) {
        printContents += '<div class="page-break"></div>';
        printContents += quarterlyDiv.outerHTML;
      }
    }

    // Add report footer
    printContents += `
      <div class="print-footer" style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; font-size: 10pt;">
        <p style="margin: 0;">IPatroller System - Provincial Government of Bataan</p>
        <p style="margin: 5px 0 0 0;">This report was generated automatically by the system</p>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IPatroller Report - ${currentDate}</title>
          <meta charset="utf-8">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
          <style>
            @media print {
              @page {
                margin: 1in;
                size: A4;
              }
              
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12pt;
                line-height: 1.4;
                color: black;
                background: white;
                margin: 0;
                padding: 0;
              }
              
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              
              .print-header h1 {
                margin: 0;
                color: #333;
                font-size: 24pt;
                font-weight: bold;
              }
              
              .print-header p {
                margin: 10px 0 0 0;
                color: #666;
                font-size: 12pt;
              }
              
              .print-footer {
                margin-top: 30px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
                text-align: center;
                color: #666;
                font-size: 10pt;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              .no-break {
                page-break-inside: avoid;
              }
              
              .card {
                border: 1px solid #ddd;
                box-shadow: none;
                margin-bottom: 20px;
                page-break-inside: avoid;
                background: white;
              }
              
              .card-body {
                padding: 15px;
              }
              
              .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                font-size: 10pt;
              }
              
              .table th,
              .table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                vertical-align: top;
              }
              
              .table th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: black;
              }
              
              .badge {
                border: 1px solid #000;
                color: black;
                background: white;
                padding: 2px 6px;
                font-size: 9pt;
                font-weight: normal;
              }
              
              .badge.bg-success {
                background: #d4edda;
                border-color: #28a745;
              }
              
              .badge.bg-danger {
                background: #f8d7da;
                border-color: #dc3545;
              }
              
              .badge.bg-warning {
                background: #fff3cd;
                border-color: #ffc107;
              }
              
              .badge.bg-info {
                background: #d1ecf1;
                border-color: #17a2b8;
              }
              
              .badge.bg-primary {
                background: #cce7ff;
                border-color: #007bff;
              }
              
              .badge.bg-secondary {
                background: #e2e3e5;
                border-color: #6c757d;
              }
              
              .progress {
                border: 1px solid #ddd;
                background: white;
                height: 8px;
              }
              
              .progress-bar {
                background: #007bff;
                border: none;
              }
              
              h1, h2, h3, h4, h5, h6 {
                color: black;
                page-break-after: avoid;
                margin-bottom: 10px;
              }
              
              h1 { font-size: 18pt; }
              h2 { font-size: 16pt; }
              h3 { font-size: 14pt; }
              h4 { font-size: 12pt; }
              
              .row {
                display: block;
              }
              
              .col, .col-md-3, .col-md-6, .col-lg-4 {
                display: block;
                width: 100%;
                margin-bottom: 15px;
                page-break-inside: avoid;
              }
              
              .d-flex {
                display: block;
              }
              
              .d-flex.align-items-center > * {
                display: block;
                margin-bottom: 5px;
              }
              
              .text-center {
                text-align: center;
              }
              
              .text-muted {
                color: #666;
              }
              
              .text-primary { color: #007bff; }
              .text-success { color: #28a745; }
              .text-danger { color: #dc3545; }
              .text-warning { color: #856404; }
              .text-info { color: #0c5460; }
              
              .fw-bold, .fw-semibold {
                font-weight: bold;
              }
              
              .small {
                font-size: 10pt;
              }
              
              .bg-light {
                background: #f8f9fa;
                border: 1px solid #ddd;
              }
              
              .shadow, .shadow-sm {
                box-shadow: none;
              }
              
              .rounded, .rounded-3 {
                border-radius: 0;
              }
              
              .mb-1, .mb-2, .mb-3, .mb-4 {
                margin-bottom: 10px;
              }
              
              .p-3, .p-4 {
                padding: 10px;
              }
              
              canvas {
                max-width: 100%;
                height: auto;
              }
            }
            
            @media screen {
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 20px;
                background: #f5f5f5;
              }
              
              .print-content {
                background: white;
                padding: 30px;
                margin: 0 auto;
                max-width: 800px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${printContents}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };
  };

  if (loading) {
    return (
      <DashboardLayout activePage="reports">
        <div className="page-container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading report data...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="reports">
      <div className="page-container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border" style={{ minHeight: 72, marginTop: '0.5rem' }}>
          <div className="d-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle shadow" style={{ width: 56, height: 56 }}>
            <i className="fas fa-chart-line text-info fs-4"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-0 fs-4">Reports</h2>
            <p className="text-muted mb-0 small">View analytics and generate reports</p>
          </div>
          <div className="d-flex align-items-center gap-2 ms-auto">
            {activeTab === 'quarterly' ? (
              <Form.Select 
                size="sm" 
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="border-0 shadow-sm"
                style={{ maxWidth: '200px' }}
              >
                {availableQuarters.map(quarter => (
                  <option key={quarter} value={quarter}>
                    {quarter}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Select 
                size="sm" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-0 shadow-sm"
                style={{ maxWidth: '200px' }}
              >
                {availableMonths.map(month => {
                  const [year, monthNum] = month.split('-');
                  const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <option key={month} value={month}>
                      {monthName}
                    </option>
                  );
                })}
              </Form.Select>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-sm border-0 rounded-3">
          <Card.Body className="p-4">
            {/* Navigation Tabs */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'analytics'} 
                    onClick={() => setActiveTab('analytics')}
                    className="border-0 text-muted fw-semibold"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Data Analytics
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'total'} 
                    onClick={() => setActiveTab('total')}
                    className="border-0 text-muted fw-semibold"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <i className="fas fa-list me-2"></i>
                    Total Per Municipality
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'quarterly'} 
                    onClick={() => setActiveTab('quarterly')}
                    className="border-0 text-muted fw-semibold"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <i className="fas fa-calendar-alt me-2"></i>
                    Quarterly Report
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'summary'} 
                    onClick={() => setActiveTab('summary')}
                    className="border-0 text-muted fw-semibold"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <i className="fas fa-clipboard-list me-2"></i>
                    Summary
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              {/* Print Controls */}
              <div className="d-flex align-items-center gap-2">
                <Form.Select 
                  size="sm" 
                  className="border-0 shadow-sm"
                  style={{ maxWidth: '150px' }}
                  onChange={(e) => setPrintSections({
                    all: e.target.value === 'All Sections',
                    summary: e.target.value === 'Summary Only',
                    analytics: e.target.value === 'Analytics Only',
                    total: e.target.value === 'Total Only',
                    quarterly: e.target.value === 'Quarterly Only'
                  })}
                >
                  <option>All Sections</option>
                  <option>Summary Only</option>
                  <option>Analytics Only</option>
                  <option>Total Only</option>
                  <option>Quarterly Only</option>
                </Form.Select>
                <Button variant="primary" size="sm" onClick={handlePrint} className="shadow-sm">
                  <i className="fas fa-print me-2"></i>
                  Print Report
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="overflow-auto">
              {activeTab === 'analytics' && (
                <div id="print-analytics">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="fas fa-chart-bar text-primary"></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-1">Data Analytics</h3>
                      <p className="text-muted mb-0 small">Visual representation of patroller data</p>
                    </div>
                  </div>
                  <div className="bg-light rounded-3 p-4" style={{ height: '400px' }}>
                    <Bar ref={chartRef} data={chartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {activeTab === 'total' && (
                <div id="print-total">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="fas fa-list text-success"></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-1">Total Per Municipality</h3>
                      <p className="text-muted mb-0 small">Comprehensive breakdown by municipality</p>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <Table className="table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Municipality</th>
                          <th>Total Patrollers</th>
                          <th>Status</th>
                          <th>Total Days</th>
                          <th>Filled Days</th>
                          <th>Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {totalPerMunicipality.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{item.municipality}</td>
                            <td>{item.totalPatrollers}</td>
                            <td>
                              <Badge bg={item.isActive ? 'success' : 'danger'}>
                                {item.status}
                              </Badge>
                            </td>
                            <td>{item.totalDays}</td>
                            <td>{item.filledDays}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                                  <div 
                                    className="progress-bar" 
                                    style={{ width: `${item.completionRate}%` }}
                                  ></div>
                                </div>
                                <span className="small fw-semibold">{item.completionRate}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {activeTab === 'quarterly' && (
                <div id="print-quarterly">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="fas fa-calendar-alt text-info"></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-1">Quarterly Report - {selectedQuarter}</h3>
                      <p className="text-muted mb-0 small">Quarterly performance overview</p>
                    </div>
                  </div>

                  {/* Quarterly Summary Cards */}
                  <Row className="g-4 mb-4">
                    <Col md={3}>
                      <Card className="text-center border-0 shadow-sm h-100">
                        <Card.Body className="p-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                            <i className="fas fa-users text-primary"></i>
                          </div>
                          <h4 className="text-primary fw-bold mb-1">{quarterlyData.summary.totalPatrollers}</h4>
                          <p className="text-muted mb-0 small">Total Patrollers</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center border-0 shadow-sm h-100">
                        <Card.Body className="p-3">
                          <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                            <i className="fas fa-check-circle text-success"></i>
                          </div>
                          <h4 className="text-success fw-bold mb-1">{quarterlyData.summary.totalActiveDays}</h4>
                          <p className="text-muted mb-0 small">Active Days</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center border-0 shadow-sm h-100">
                        <Card.Body className="p-3">
                          <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                            <i className="fas fa-times-circle text-danger"></i>
                          </div>
                          <h4 className="text-danger fw-bold mb-1">{quarterlyData.summary.totalInactiveDays}</h4>
                          <p className="text-muted mb-0 small">Inactive Days</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center border-0 shadow-sm h-100">
                        <Card.Body className="p-3">
                          <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                            <i className="fas fa-percentage text-info"></i>
                          </div>
                          <h4 className="text-info fw-bold mb-1">{quarterlyData.summary.activePercentage.toFixed(1)}%</h4>
                          <p className="text-muted mb-0 small">Active Percentage</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Quarterly Chart */}
                  <div className="bg-light rounded-3 p-4 mb-4" style={{ height: '400px' }}>
                    <Bar data={quarterlyChartData} options={quarterlyChartOptions} />
                  </div>

                  {/* Quarterly Table */}
                  <div className="table-responsive">
                    <Table className="table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Municipality</th>
                          <th>Total Patrollers</th>
                          <th>Active Days</th>
                          <th>Inactive Days</th>
                          <th>Total Days</th>
                          <th>Active Rate</th>
                          <th>Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(quarterlyData.municipalities).map(([municipality, data], index) => {
                          const activeRate = data.totalDays > 0 ? (data.activeDays / data.totalDays) * 100 : 0;
                          const performance = activeRate >= 80 ? 'Excellent' : activeRate >= 60 ? 'Good' : activeRate >= 40 ? 'Fair' : 'Poor';
                          const performanceColor = activeRate >= 80 ? 'success' : activeRate >= 60 ? 'info' : activeRate >= 40 ? 'warning' : 'danger';

                          return (
                            <tr key={index}>
                              <td className="fw-semibold">{municipality}</td>
                              <td>{data.totalPatrollers}</td>
                              <td>
                                <Badge bg="success">{data.activeDays}</Badge>
                              </td>
                              <td>
                                <Badge bg="danger">{data.inactiveDays}</Badge>
                              </td>
                              <td>
                                <Badge bg="secondary">{data.totalDays}</Badge>
                              </td>
                              <td>
                                <span className={`fw-semibold ${activeRate >= 80 ? 'text-success' : activeRate >= 60 ? 'text-info' : activeRate >= 40 ? 'text-warning' : 'text-danger'}`}>
                                  {activeRate.toFixed(1)}%
                                </span>
                              </td>
                              <td>
                                <Badge bg={performanceColor}>{performance}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {activeTab === 'summary' && (
                <div id="print-summary">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="fas fa-clipboard-list text-warning"></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-1">Summary Report</h3>
                      <p className="text-muted mb-0 small">Overview of all system data</p>
                    </div>
                  </div>
                  <Row className="g-4">
                    {summaryData.map((item, index) => (
                      <Col md={6} lg={4} key={index}>
                        <Card className="border-0 shadow-sm h-100">
                          <Card.Body className="text-center p-4">
                            <div className={`bg-${item.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} style={{ width: 56, height: 56 }}>
                              <i className={`fas ${item.icon} text-${item.color} fs-4`}></i>
                            </div>
                            <h4 className={`text-${item.color} fw-bold mb-2`}>{item.value}</h4>
                            <p className="text-muted mb-0">{item.label}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Reports;