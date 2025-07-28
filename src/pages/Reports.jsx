import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Row, Col, Button, Table, Badge, Stack, Nav, Form } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useIPatrollerData } from '../context/IPatrollerContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SectionHeader from '../components/SectionHeader';

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
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [printSections, setPrintSections] = useState({
    all: true,
    summary: false,
    analytics: false,
    total: false,
    quarterly: false
  });
  const chartRef = useRef();
  const reportContentRef = useRef(null);

  // Get IPatroller data from context
  const {
    loading,
    selectedMonth,
    setSelectedMonth,
    getCurrentMonthData,
    getStatusData,
    getSummaryStats,
    availableMonths,
    allData
  } = useIPatrollerData();

  // Generate all months for current year
  const generateCurrentYearMonths = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
      months.push(monthKey);
    }
    return months;
  };

  // Get available months (combine existing data with current year months)
  const getAllAvailableMonths = () => {
    try {
      const existingMonths = availableMonths || [];
      const currentYearMonths = generateCurrentYearMonths();
      
      // Combine and remove duplicates, keeping current year months first
      const allMonths = [...currentYearMonths, ...existingMonths];
      const uniqueMonths = [...new Set(allMonths)];
      
      // Validate months to ensure they're in correct format
      const validMonths = uniqueMonths.filter(month => {
        if (!month || typeof month !== 'string') return false;
        if (!month.includes('-')) return false;
        const [year, monthNum] = month.split('-');
        if (!year || !monthNum) return false;
        const yearNum = parseInt(year);
        const monthNumInt = parseInt(monthNum);
        if (isNaN(yearNum) || isNaN(monthNumInt)) return false;
        if (yearNum < 2000 || yearNum > 2100) return false;
        if (monthNumInt < 1 || monthNumInt > 12) return false;
        return true;
      });
      
      return validMonths;
    } catch (error) {
      console.error('Error getting available months:', error);
      return [];
    }
  };

  const allAvailableMonths = getAllAvailableMonths();

  // Get data source information
  const getDataSourceInfo = () => {
    try {
      const monthData = allData[selectedMonth];
      if (!monthData) return { source: 'Empty', count: 0 };
      
      const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
      let totalEntries = 0;
      let municipalitiesWithData = 0;
      
      municipalities.forEach(muni => {
        const counts = monthData[muni] || [];
        const validCounts = counts.filter(count => count !== '' && count !== null && count !== undefined);
        totalEntries += validCounts.length;
        if (validCounts.length > 0) municipalitiesWithData++;
      });
      
      return {
        source: 'IPatrollerStatus',
        totalEntries,
        municipalitiesWithData,
        totalMunicipalities: municipalities.length
      };
    } catch (error) {
      console.error('Error getting data source info:', error);
      return { source: 'Error', count: 0 };
    }
  };

  // Log when selected month changes for debugging
  useEffect(() => {
    console.log('Selected month changed to:', selectedMonth);
    console.log('All available data keys:', Object.keys(allData));
    console.log('Available months from context:', availableMonths);
  }, [selectedMonth, allData]);

  // Get current month's data with proper connection to IPatrollerStatus
  const getConnectedMonthData = () => {
    try {
      const monthData = allData[selectedMonth];
      if (monthData) {
        console.log(`✅ Data found for ${selectedMonth} from IPatrollerStatus:`, monthData);
        return monthData;
      }
      
      // If no data exists for this month, return empty data structure
      console.log(`⚠️ No data found for ${selectedMonth} in IPatrollerStatus, returning empty structure`);
      
      // Return safe empty structure without array creation
      const emptyData = {
        'ABUCAY': [],
        'ORANI': [],
        'SAMAL': [],
        'HERMOSA': [],
        'BALANGA': [],
        'PILAR': [],
        'ORION': [],
        'LIMAY': [],
        'BAGAC': [],
        'DINALUPIHAN': [],
        'MARIVELES': [],
        'MORONG': [],
      };
      
      return emptyData;
    } catch (error) {
      console.error('Error getting connected month data:', error);
      return {
        'ABUCAY': [],
        'ORANI': [],
        'SAMAL': [],
        'HERMOSA': [],
        'BALANGA': [],
        'PILAR': [],
        'ORION': [],
        'LIMAY': [],
        'BAGAC': [],
        'DINALUPIHAN': [],
        'MARIVELES': [],
        'MORONG': [],
      };
    }
  };

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
    try {
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
    } catch (error) {
      console.error('Error getting quarterly data:', error);
      return {
        municipalities: {},
        summary: {
          totalPatrollers: 0,
          totalActiveDays: 0,
          totalInactiveDays: 0,
          totalDays: 0,
          activePercentage: 0,
          inactivePercentage: 0
        }
      };
    }
  };

  // Get quarterly chart data
  const getQuarterlyChartData = () => {
    try {
      const quarterlyData = getQuarterlyData(selectedQuarter);
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
      
      const activeData = municipalities.map(muni => {
        const data = quarterlyData.municipalities[muni];
        return data ? data.activeDays : 0;
      });

      const inactiveData = municipalities.map(muni => {
        const data = quarterlyData.municipalities[muni];
        return data ? data.inactiveDays : 0;
      });

      const totalData = municipalities.map(muni => {
        const data = quarterlyData.municipalities[muni];
        return data ? data.totalPatrollers : 0;
      });

    return {
      labels: municipalities,
      datasets: [
        {
          label: 'Active Days',
            data: activeData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Inactive Days',
            data: inactiveData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        },
        {
          label: 'Total Patrollers',
            data: totalData,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        }
      ]
    };
    } catch (error) {
      console.error('Error getting quarterly chart data:', error);
      return {
        labels: ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'],
        datasets: [
          {
            label: 'Active Days',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Inactive Days',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          },
          {
            label: 'Total Patrollers',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
          }
        ]
      };
    }
  };

  // Calculate real data for chart using IPatroller data
  const getChartData = () => {
    try {
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
      const currentData = getConnectedMonthData();
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
    } catch (error) {
      console.error('Error generating chart data:', error);
      return {
        labels: ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'],
        datasets: [
          {
            label: 'Active Municipalities',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Inactive Municipalities',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          },
          {
            label: 'Total Patrollers',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
          }
        ]
      };
    }
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
    try {
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
      const currentData = getConnectedMonthData();
    const statusData = getStatusData();
    
    return municipalities.map(muni => {
      const counts = currentData[muni] || [];
      const totalPatrollers = counts.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
        const activeDays = counts.filter(count => parseInt(count) >= 5).length;
        const inactiveDays = counts.filter(count => parseInt(count) < 5 && parseInt(count) > 0).length;
        const totalDays = counts.filter(count => count !== '' && count !== null && count !== undefined).length;
      
      return {
        municipality: muni,
        totalPatrollers,
          activeDays,
          inactiveDays,
          totalDays,
          status: statusData[muni] || 'Unknown',
          activePercentage: totalDays > 0 ? (activeDays / totalDays) * 100 : 0,
          inactivePercentage: totalDays > 0 ? (inactiveDays / totalDays) * 100 : 0
        };
      });
    } catch (error) {
      console.error('Error getting total per municipality:', error);
      return [];
    }
  };

  // Get summary data
  const getSummaryData = () => {
    try {
      const currentData = getConnectedMonthData();
    const municipalities = ['ABUCAY', 'ORANI', 'SAMAL', 'HERMOSA', 'BALANGA', 'PILAR', 'ORION', 'LIMAY', 'BAGAC', 'DINALUPIHAN', 'MARIVELES', 'MORONG'];
    
    let totalPatrollers = 0;
      let totalActiveDays = 0;
      let totalInactiveDays = 0;
      let totalDays = 0;
    let activeMunicipalities = 0;
    let inactiveMunicipalities = 0;
    
    municipalities.forEach(muni => {
      const counts = currentData[muni] || [];
        const municipalityTotal = counts.reduce((sum, count) => sum + (parseInt(count) || 0), 0);
        const municipalityActiveDays = counts.filter(count => parseInt(count) >= 5).length;
        const municipalityInactiveDays = counts.filter(count => parseInt(count) < 5 && parseInt(count) > 0).length;
        const municipalityTotalDays = counts.filter(count => count !== '' && count !== null && count !== undefined).length;
        
        totalPatrollers += municipalityTotal;
        totalActiveDays += municipalityActiveDays;
        totalInactiveDays += municipalityInactiveDays;
        totalDays += municipalityTotalDays;
        
        if (municipalityActiveDays > municipalityInactiveDays) {
        activeMunicipalities++;
        } else if (municipalityInactiveDays > municipalityActiveDays) {
        inactiveMunicipalities++;
      }
    });
    
      return {
        totalPatrollers,
        totalActiveDays,
        totalInactiveDays,
        totalDays,
        activeMunicipalities,
        inactiveMunicipalities,
        averagePatrollersPerMunicipality: municipalities.length > 0 ? totalPatrollers / municipalities.length : 0,
        activePercentage: totalDays > 0 ? (totalActiveDays / totalDays) * 100 : 0,
        inactivePercentage: totalDays > 0 ? (totalInactiveDays / totalDays) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting summary data:', error);
      return {
        totalPatrollers: 0,
        totalActiveDays: 0,
        totalInactiveDays: 0,
        totalDays: 0,
        activeMunicipalities: 0,
        inactiveMunicipalities: 0,
        averagePatrollersPerMunicipality: 0,
        activePercentage: 0,
        inactivePercentage: 0
      };
    }
  };

  const exportToPDF = async () => {
    const input = reportContentRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('ipatroller-report.pdf');
  };

  const summaryData = getSummaryData();
  const totalData = getTotalPerMunicipality();
  const quarterlyData = getQuarterlyData(selectedQuarter);
  const quarterlyChartData = getQuarterlyChartData();
  const dataSourceInfo = getDataSourceInfo();

  return (
    <DashboardLayout activePage="reports">
      <div className="content-wrapper page-container" style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', overflowX: 'hidden', padding: 0 }}>
        {/* Header */}
        <SectionHeader icon="fa-chart-line" title="Reports" subtitle="Analytics and reporting" />

          {/* Enhanced Main Content Card */}
          <Card className="border-0 rounded-4" style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <Card.Body className="p-4">
              {/* Enhanced Navigation Tabs */}
              <div className="d-flex align-items-center justify-content-between mb-4">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'analytics'} 
                      onClick={() => setActiveTab('analytics')}
                      className="border-0 fw-semibold rounded-3"
                      style={{ 
                        padding: '1rem 1.5rem',
                        marginRight: '0.5rem',
                        background: activeTab === 'analytics' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        color: activeTab === 'analytics' ? 'white' : '#6c757d',
                        boxShadow: activeTab === 'analytics' ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
                      }}
                    >
                      <i className="fas fa-chart-bar me-2"></i>
                      Data Analytics
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'total'} 
                      onClick={() => setActiveTab('total')}
                      className="border-0 fw-semibold rounded-3"
                      style={{ 
                        padding: '1rem 1.5rem',
                        marginRight: '0.5rem',
                        background: activeTab === 'total' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        color: activeTab === 'total' ? 'white' : '#6c757d',
                        boxShadow: activeTab === 'total' ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
                      }}
                    >
                      <i className="fas fa-list me-2"></i>
                      Total Per Municipality
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'quarterly'} 
                      onClick={() => setActiveTab('quarterly')}
                      className="border-0 fw-semibold rounded-3"
                      style={{ 
                        padding: '1rem 1.5rem',
                        marginRight: '0.5rem',
                        background: activeTab === 'quarterly' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        color: activeTab === 'quarterly' ? 'white' : '#6c757d',
                        boxShadow: activeTab === 'quarterly' ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
                      }}
                    >
                      <i className="fas fa-calendar-alt me-2"></i>
                      Quarterly Report
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'summary'} 
                      onClick={() => setActiveTab('summary')}
                      className="border-0 fw-semibold rounded-3"
                      style={{ 
                        padding: '1rem 1.5rem',
                        background: activeTab === 'summary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        color: activeTab === 'summary' ? 'white' : '#6c757d',
                        boxShadow: activeTab === 'summary' ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
                      }}
                    >
                      <i className="fas fa-clipboard-list me-2"></i>
                      Summary
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                
                {/* Enhanced Print Button */}
                <Button 
                  variant="danger" 
                    size="sm" 
                  onClick={exportToPDF}
                  className="d-flex align-items-center gap-2 rounded-3"
                  style={{
                    background: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(229, 57, 53, 0.3)',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  <i className="fas fa-file-pdf"></i>
                  Export to PDF
                  </Button>
              </div>

              {/* Enhanced Data Source Info */}
              <div className="d-flex align-items-center justify-content-between p-4 mb-4 rounded-4" 
                   style={{ 
                     background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                     border: '1px solid rgba(102, 126, 234, 0.2)',
                     boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
                   }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3" 
                       style={{ 
                         width: 48, 
                         height: 48, 
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                         boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)'
                       }}>
                    <i className="fas fa-database text-white"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>Data Source Information</h6>
                    <div className="d-flex align-items-center gap-4 text-muted" style={{ fontSize: '0.9rem' }}>
                      <span><i className="fas fa-server me-1"></i><strong>Source:</strong> {dataSourceInfo.source}</span>
                      <span><i className="fas fa-list me-1"></i><strong>Entries:</strong> {dataSourceInfo.totalEntries}</span>
                      <span><i className="fas fa-map-marker-alt me-1"></i><strong>Municipalities:</strong> {dataSourceInfo.municipalitiesWithData}/{dataSourceInfo.totalMunicipalities}</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="success" className="rounded-pill px-3 py-2">
                    <i className="fas fa-check-circle me-1"></i>
                    Connected
                  </Badge>
                </div>
              </div>

              {/* Tab Content */}
              <div ref={reportContentRef}>
                {activeTab === 'analytics' && (
                  <div>
                    <Row>
                      <Col lg={7}>
                        <Card className="border-0 rounded-4 mb-4" style={{ 
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}>
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                              <h4 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                                <i className="fas fa-chart-bar me-2 text-primary"></i>
                                Patroller Analytics
                              </h4>
                              <Badge bg="primary" className="rounded-pill px-3 py-2">
                                <i className="fas fa-chart-line me-1"></i>
                                Real-time Data
                              </Badge>
                            </div>
                            <div style={{ height: '400px' }}>
                              <Bar data={chartData} options={chartOptions} ref={chartRef} />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={5}>
                        <Card className="border-0 rounded-4 mb-4" style={{ 
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          height: 'calc(100% - 1.5rem)'  // Adjust height to match the analytics card
                        }}>
                          <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4" style={{ color: '#2c3e50' }}>
                              <i className="fas fa-tachometer-alt me-2 text-primary"></i>
                              Quick Stats
                            </h5>
                            <div className="d-flex flex-column gap-3">
                              <div className="d-flex align-items-center justify-content-between p-4 rounded-4" 
                                   style={{ 
                                     background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                                     boxShadow: '0 4px 15px rgba(76, 175, 80, 0.2)'
                                   }}>
                    <div>
                                <div className="text-success fw-bold fs-2">{summaryData.totalPatrollers}</div>
                                <div className="text-muted small fw-semibold">Total Patrollers</div>
                    </div>
                              <div className="d-flex align-items-center justify-content-center rounded-3" 
                                   style={{ 
                                     width: 56, 
                                     height: 56, 
                                     background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                     boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                                   }}>
                                <i className="fas fa-users text-white fs-4"></i>
                  </div>
                  </div>
                            <div className="d-flex align-items-center justify-content-between p-4 rounded-4" 
                                 style={{ 
                                   background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                                   boxShadow: '0 4px 15px rgba(255, 152, 0, 0.2)'
                                 }}>
                              <div>
                                <div className="text-warning fw-bold fs-2">{summaryData.activeMunicipalities}</div>
                                <div className="text-muted small fw-semibold">Active Municipalities</div>
                </div>
                              <div className="d-flex align-items-center justify-content-center rounded-3" 
                                   style={{ 
                                     width: 56, 
                                     height: 56, 
                                     background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                                     boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
                                   }}>
                                <i className="fas fa-check-circle text-white fs-4"></i>
                    </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between p-4 rounded-4" 
                                 style={{ 
                                   background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                                   boxShadow: '0 4px 15px rgba(244, 67, 54, 0.2)'
                                 }}>
                    <div>
                                <div className="text-danger fw-bold fs-2">{summaryData.inactiveMunicipalities}</div>
                                <div className="text-muted small fw-semibold">Inactive Municipalities</div>
                    </div>
                              <div className="d-flex align-items-center justify-content-center rounded-3" 
                                   style={{ 
                                     width: 56, 
                                     height: 56, 
                                     background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                                     boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
                                   }}>
                                <i className="fas fa-times-circle text-white fs-4"></i>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'total' && (
                <Card className="border-0 rounded-4" style={{ 
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h4 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                        <i className="fas fa-list me-2 text-primary"></i>
                        Total Per Municipality
                      </h4>
                      <Badge bg="info" className="rounded-pill px-3 py-2">
                        <i className="fas fa-table me-1"></i>
                        {totalData.length} Municipalities
                      </Badge>
                  </div>
                  <div className="table-responsive">
                    <Table className="table-hover">
                        <thead>
                          <tr style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }}>
                            <th className="border-0 fw-bold">Municipality</th>
                            <th className="border-0 text-center fw-bold">Total Patrollers</th>
                            <th className="border-0 text-center fw-bold">Active Days</th>
                            <th className="border-0 text-center fw-bold">Inactive Days</th>
                            <th className="border-0 text-center fw-bold">Status</th>
                            <th className="border-0 text-center fw-bold">Active %</th>
                        </tr>
                      </thead>
                      <tbody>
                          {totalData.map((item, index) => (
                            <tr key={index} style={{ 
                              background: index % 2 === 0 ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                              transition: 'all 0.3s ease'
                            }}>
                              <td className="fw-bold" style={{ color: '#2c3e50' }}>
                                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                                {item.municipality}
                              </td>
                              <td className="text-center">
                                <Badge bg="primary" className="fs-6 rounded-pill px-3 py-2" style={{ 
                                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                }}>
                                  {item.totalPatrollers}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg="success" className="rounded-pill px-3 py-2" style={{ 
                                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                                }}>
                                  {item.activeDays}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg="danger" className="rounded-pill px-3 py-2" style={{ 
                                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
                                }}>
                                  {item.inactiveDays}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg={item.status === 'Active' ? 'success' : item.status === 'Inactive' ? 'danger' : 'secondary'} 
                                       className="rounded-pill px-3 py-2" style={{ 
                                         boxShadow: item.status === 'Active' ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 
                                                    item.status === 'Inactive' ? '0 2px 8px rgba(244, 67, 54, 0.3)' : 
                                                    '0 2px 8px rgba(108, 117, 125, 0.3)'
                                       }}>
                                  <i className={`fas fa-${item.status === 'Active' ? 'check-circle' : item.status === 'Inactive' ? 'times-circle' : 'question-circle'} me-1`}></i>
                                {item.status}
                              </Badge>
                            </td>
                              <td className="text-center">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="progress flex-grow-1" style={{ height: '24px', borderRadius: '12px' }}>
                                  <div 
                                    className="progress-bar" 
                                      style={{ 
                                        width: `${item.activePercentage}%`,
                                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                        borderRadius: '12px'
                                      }}
                                    >
                                      <span className="fw-bold text-white" style={{ fontSize: '0.8rem' }}>
                                        {item.activePercentage.toFixed(1)}%
                                      </span>
                                </div>
                                  </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  </Card.Body>
                </Card>
              )}

              {activeTab === 'quarterly' && (
                <div>
                  <Row>
                    <Col lg={8}>
                      <Card className="shadow-sm border-0 rounded-3 mb-4">
                        <Card.Body className="p-4">
                          <h4 className="fw-bold mb-3">Quarterly Analytics - {selectedQuarter}</h4>
                          <div style={{ height: '400px' }}>
                            <Bar data={quarterlyChartData} options={chartOptions} />
                    </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={4}>
                      <Card className="shadow-sm border-0 rounded-3 mb-4">
                        <Card.Body className="p-4">
                          <h5 className="fw-bold mb-3">Quarterly Summary</h5>
                          <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
                    <div>
                                <div className="text-success fw-bold fs-4">{quarterlyData.summary.totalPatrollers}</div>
                                <div className="text-muted small">Total Patrollers</div>
                    </div>
                              <i className="fas fa-users text-success fs-3"></i>
                  </div>
                            <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)' }}>
                              <div>
                                <div className="text-warning fw-bold fs-4">{quarterlyData.summary.totalActiveDays}</div>
                                <div className="text-muted small">Active Days</div>
                          </div>
                              <i className="fas fa-check-circle text-warning fs-3"></i>
                            </div>
                            <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' }}>
                              <div>
                                <div className="text-danger fw-bold fs-4">{quarterlyData.summary.totalInactiveDays}</div>
                                <div className="text-muted small">Inactive Days</div>
                              </div>
                              <i className="fas fa-times-circle text-danger fs-3"></i>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                          </div>
              )}

              {activeTab === 'summary' && (
                <div>
                  <Row>
                    <Col lg={8}>
                      <Card className="shadow-sm border-0 rounded-3 mb-4">
                        <Card.Body className="p-4">
                          <h4 className="fw-bold mb-3">Summary Report - {selectedMonth}</h4>
                          <Row>
                            <Col md={6}>
                              <div className="d-flex align-items-center justify-content-between p-4 rounded mb-3" style={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
                                <div>
                                  <div className="text-success fw-bold fs-2">{summaryData.totalPatrollers}</div>
                                  <div className="text-muted">Total Patrollers</div>
                                </div>
                                <i className="fas fa-users text-success fs-1"></i>
                              </div>
                    </Col>
                            <Col md={6}>
                              <div className="d-flex align-items-center justify-content-between p-4 rounded mb-3" style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)' }}>
                                <div>
                                  <div className="text-warning fw-bold fs-2">{summaryData.totalActiveDays}</div>
                                  <div className="text-muted">Active Days</div>
                          </div>
                                <i className="fas fa-check-circle text-warning fs-1"></i>
                              </div>
                    </Col>
                            <Col md={6}>
                              <div className="d-flex align-items-center justify-content-between p-4 rounded mb-3" style={{ background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' }}>
                                <div>
                                  <div className="text-danger fw-bold fs-2">{summaryData.totalInactiveDays}</div>
                                  <div className="text-muted">Inactive Days</div>
                          </div>
                                <i className="fas fa-times-circle text-danger fs-1"></i>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="d-flex align-items-center justify-content-between p-4 rounded mb-3" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                                <div>
                                  <div className="text-info fw-bold fs-2">{summaryData.averagePatrollersPerMunicipality.toFixed(1)}</div>
                                  <div className="text-muted">Avg. Per Municipality</div>
                                </div>
                                <i className="fas fa-chart-line text-info fs-1"></i>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={4}>
                      <Card className="shadow-sm border-0 rounded-3 mb-4">
                        <Card.Body className="p-4">
                          <h5 className="fw-bold mb-3">Performance Metrics</h5>
                          <div className="d-flex flex-column gap-3">
                            <div>
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">Active Percentage</span>
                                <span className="fw-bold">{summaryData.activePercentage.toFixed(1)}%</span>
                  </div>
                              <div className="progress">
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ width: `${summaryData.activePercentage}%` }}
                                ></div>
                  </div>
                    </div>
                    <div>
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">Inactive Percentage</span>
                                <span className="fw-bold">{summaryData.inactivePercentage.toFixed(1)}%</span>
                    </div>
                              <div className="progress">
                                <div 
                                  className="progress-bar bg-danger" 
                                  style={{ width: `${summaryData.inactivePercentage}%` }}
                                ></div>
                  </div>
                            </div>
                          </div>
                          </Card.Body>
                        </Card>
                      </Col>
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