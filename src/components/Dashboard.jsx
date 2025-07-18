import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Security as SecurityIcon,
  ControlCamera as CommandCenterIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Gavel as GavelIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import patrollerService from '../services/patrollerService';
import illegalService from '../services/illegalService';

const DashboardCard = ({ title, icon, value, subtitle, color, onClick, isLoading }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: 3,
      } : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        {onClick && (
          <IconButton size="small" sx={{ ml: 'auto' }}>
            <ArrowForwardIcon />
          </IconButton>
        )}
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
        {isLoading ? <CircularProgress size={24} /> : value}
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Fetch IPatroller data
  const { data: patrollerData, isLoading: isPatrollerLoading, error: patrollerError } = useQuery({
    queryKey: ['patrollerStats', currentYear, currentMonth],
    queryFn: () => patrollerService.getPatrollerStats(currentYear, currentMonth),
    staleTime: 30000,
    cacheTime: 3600000,
  });

  // Fetch Illegals data
  const { data: illegalReports, isLoading: isIllegalLoading, error: illegalError } = useQuery({
    queryKey: ['illegalReports'],
    queryFn: () => illegalService.getIllegalReports(),
    staleTime: 30000,
    cacheTime: 3600000,
  });

  // Calculate statistics
  const stats = {
    activePatrollers: patrollerData?.overview?.activePatrollers || 0,
    totalViolations: illegalReports?.length || 0,
    pendingViolations: illegalReports?.filter(report => report.status === 'pending').length || 0,
    resolvedViolations: illegalReports?.filter(report => report.status === 'resolved').length || 0,
    inactivePatrollers: patrollerData?.overview?.inactivePatrollers || 0,
    activityRate: patrollerData?.overview?.activityRate || 0,
  };

  if (patrollerError || illegalError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading dashboard data: {patrollerError?.message || illegalError?.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard Overview
      </Typography>

      {/* Main Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Active IPatrollers"
            icon={<SecurityIcon sx={{ color: '#059669' }} />}
            value={stats.activePatrollers}
            subtitle={`${stats.activityRate}% Activity Rate`}
            color="#059669"
            onClick={() => navigate('/ipatroller')}
            isLoading={isPatrollerLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Total Violations"
            icon={<GavelIcon sx={{ color: '#dc2626' }} />}
            value={stats.totalViolations}
            subtitle={`${stats.pendingViolations} pending, ${stats.resolvedViolations} resolved`}
            color="#dc2626"
            onClick={() => navigate('/illegals')}
            isLoading={isIllegalLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Command Centers"
            icon={<CommandCenterIcon sx={{ color: '#2563eb' }} />}
            value="3"
            subtitle="All centers operational"
            color="#2563eb"
            onClick={() => navigate('/command-center')}
            isLoading={false}
          />
        </Grid>
      </Grid>

      {/* IPatroller Status Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                IPatroller Status
              </Typography>
              <Button
                endIcon={<ArrowForwardIcon />}
                sx={{ ml: 'auto' }}
                onClick={() => navigate('/ipatroller')}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography>Active</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {isPatrollerLoading ? <CircularProgress size={24} /> : stats.activePatrollers}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CancelIcon sx={{ color: 'error.main', mr: 1 }} />
                  <Typography>Inactive</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {isPatrollerLoading ? <CircularProgress size={24} /> : stats.inactivePatrollers}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Violations Status Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GavelIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Violations Status
              </Typography>
              <Button
                endIcon={<ArrowForwardIcon />}
                sx={{ ml: 'auto' }}
                onClick={() => navigate('/illegals')}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography>Pending</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {isIllegalLoading ? <CircularProgress size={24} /> : stats.pendingViolations}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography>Resolved</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {isIllegalLoading ? <CircularProgress size={24} /> : stats.resolvedViolations}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 