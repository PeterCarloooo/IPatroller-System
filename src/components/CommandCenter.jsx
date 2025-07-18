import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import patrollerService from '../services/patrollerService';

const CommandCenter = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Generate year options (current year and next 2 years)
  const years = Array.from(
    { length: 3 },
    (_, i) => currentDate.getFullYear() + i
  );

  // Generate month options
  const months = Array.from(
    { length: 12 },
    (_, i) => ({
      value: i + 1,
      label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
    })
  );

  // Fetch patroller statistics
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['patrollerStats', selectedYear, selectedMonth],
    queryFn: () => patrollerService.getPatrollerStats(selectedYear, selectedMonth),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000 // Keep data in cache for 30 minutes
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading patroller statistics: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
        Command Center
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={selectedMonth}
            label="Month"
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map(month => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="h6">
                  Total Incidents
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats?.overview.totalIncidents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="h6">
                  Total Patrollers
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats?.overview.totalPatrollers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="h6">
                  Active Patrollers
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats?.overview.activePatrollers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CancelIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="h6">
                  Inactive Patrollers
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {stats?.overview.inactivePatrollers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* District Statistics Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>District</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total Incidents</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Active Patrollers</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Inactive Patrollers</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Activity Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats && Object.entries(stats.districtStats).map(([district, data]) => {
              const totalPatrollers = data.activePatrollers + data.inactivePatrollers;
              const activityRate = totalPatrollers > 0
                ? ((data.activePatrollers / totalPatrollers) * 100).toFixed(1)
                : '0.0';

              return (
                <TableRow key={district} hover>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                    {district}
                  </TableCell>
                  <TableCell align="center">{data.incidents}</TableCell>
                  <TableCell align="center" sx={{ color: 'success.main' }}>
                    {data.activePatrollers}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'error.main' }}>
                    {data.inactivePatrollers}
                  </TableCell>
                  <TableCell align="center">
                    {activityRate}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="textSecondary">
        Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'N/A'}
      </Typography>
    </Box>
  );
};

export default CommandCenter; 