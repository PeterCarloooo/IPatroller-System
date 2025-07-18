import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`setup-tabpanel-${index}`}
    aria-labelledby={`setup-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Setup = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'IPatroller System',
    defaultDistrict: '1ST DISTRICT',
    autoSave: true,
    refreshInterval: 5,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    alertThreshold: 10,
    dailyReport: true,
    weeklyReport: true,
  });

  // User Management State
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', role: 'admin', email: 'admin@example.com' },
    { id: 2, name: 'Manager', role: 'manager', email: 'manager@example.com' },
  ]);
  const [newUser, setNewUser] = useState({ name: '', role: '', email: '' });

  // Location Management State
  const [locations, setLocations] = useState([
    { id: 1, district: '1ST DISTRICT', municipality: 'ABUCAY' },
    { id: 2, district: '1ST DISTRICT', municipality: 'ORANI' },
  ]);
  const [newLocation, setNewLocation] = useState({ district: '', municipality: '' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGeneralSettingsSave = () => {
    // Save general settings logic here
    setToast({
      open: true,
      message: 'General settings saved successfully',
      severity: 'success',
    });
  };

  const handleNotificationSettingsSave = () => {
    // Save notification settings logic here
    setToast({
      open: true,
      message: 'Notification settings saved successfully',
      severity: 'success',
    });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.role || !newUser.email) {
      setToast({
        open: true,
        message: 'Please fill all user fields',
        severity: 'error',
      });
      return;
    }
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setNewUser({ name: '', role: '', email: '' });
    setToast({
      open: true,
      message: 'User added successfully',
      severity: 'success',
    });
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
    setToast({
      open: true,
      message: 'User deleted successfully',
      severity: 'success',
    });
  };

  const handleAddLocation = () => {
    if (!newLocation.district || !newLocation.municipality) {
      setToast({
        open: true,
        message: 'Please fill all location fields',
        severity: 'error',
      });
      return;
    }
    setLocations([...locations, { ...newLocation, id: locations.length + 1 }]);
    setNewLocation({ district: '', municipality: '' });
    setToast({
      open: true,
      message: 'Location added successfully',
      severity: 'success',
    });
  };

  const handleDeleteLocation = (id) => {
    setLocations(locations.filter(location => location.id !== id));
    setToast({
      open: true,
      message: 'Location deleted successfully',
      severity: 'success',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        System Setup
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="General Settings" />
          <Tab label="Notifications" />
          <Tab label="User Management" />
          <Tab label="Location Management" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="System Name"
                value={generalSettings.systemName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Default District</InputLabel>
                <Select
                  value={generalSettings.defaultDistrict}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, defaultDistrict: e.target.value })}
                  label="Default District"
                >
                  <MenuItem value="1ST DISTRICT">1ST DISTRICT</MenuItem>
                  <MenuItem value="2ND DISTRICT">2ND DISTRICT</MenuItem>
                  <MenuItem value="3RD DISTRICT">3RD DISTRICT</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Auto-refresh Interval (minutes)"
                value={generalSettings.refreshInterval}
                onChange={(e) => setGeneralSettings({ ...generalSettings, refreshInterval: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={generalSettings.autoSave}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, autoSave: e.target.checked })}
                    color="primary"
                  />
                }
                label="Enable Auto-save"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleGeneralSettingsSave}
                sx={{ mt: 2 }}
              >
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                    color="primary"
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Alert Threshold"
                value={notificationSettings.alertThreshold}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, alertThreshold: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.dailyReport}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, dailyReport: e.target.checked })}
                    color="primary"
                  />
                }
                label="Daily Report"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.weeklyReport}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })}
                    color="primary"
                  />
                }
                label="Weekly Report"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleNotificationSettingsSave}
                sx={{ mt: 2 }}
              >
                Save Notification Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* User Management */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </Grid>
            <Grid item xs={12}>
              <List>
                {users.map((user) => (
                  <ListItem key={user.id} divider>
                    <ListItemText
                      primary={user.name}
                      secondary={`${user.role} - ${user.email}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleDeleteUser(user.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Location Management */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>District</InputLabel>
                <Select
                  value={newLocation.district}
                  onChange={(e) => setNewLocation({ ...newLocation, district: e.target.value })}
                  label="District"
                >
                  <MenuItem value="1ST DISTRICT">1ST DISTRICT</MenuItem>
                  <MenuItem value="2ND DISTRICT">2ND DISTRICT</MenuItem>
                  <MenuItem value="3RD DISTRICT">3RD DISTRICT</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Municipality"
                value={newLocation.municipality}
                onChange={(e) => setNewLocation({ ...newLocation, municipality: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddLocation}
              >
                Add Location
              </Button>
            </Grid>
            <Grid item xs={12}>
              <List>
                {locations.map((location) => (
                  <ListItem key={location.id} divider>
                    <ListItemText
                      primary={location.municipality}
                      secondary={location.district}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleDeleteLocation(location.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Setup; 