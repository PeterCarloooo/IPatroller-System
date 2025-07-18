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
  Stack,
  Avatar,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import { auth } from '../api/firebase';
import { updateProfile, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

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
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reAuthDialogOpen, setReAuthDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile Form
  const profileForm = useForm(
    {
      displayName: user?.displayName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      photoURL: user?.photoURL || ''
    },
    {
      displayName: {
        required: 'Display name is required',
        minLength: 3,
        maxLength: 50
      },
      phoneNumber: {
        pattern: /^\+?[1-9]\d{1,14}$/,
        message: 'Please enter a valid phone number'
      }
    },
    async (values) => {
      setLoading(true);
      try {
        await updateProfile(auth.currentUser, {
          displayName: values.displayName,
          photoURL: values.photoURL
        });
        // Show success message
        alert('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile');
      } finally {
        setLoading(false);
      }
    }
  );

  // Password Form
  const passwordForm = useForm(
    {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    {
      currentPassword: {
        required: 'Current password is required'
      },
      newPassword: {
        required: 'New password is required',
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
      },
      confirmPassword: {
        required: 'Please confirm your password',
        matches: 'newPassword',
        matchMessage: 'Passwords do not match'
      }
    },
    async (values) => {
      setLoading(true);
      try {
        // Re-authenticate user
        const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Update password
        await updatePassword(auth.currentUser, values.newPassword);
        
        // Reset form and show success message
        passwordForm.resetForm();
        alert('Password updated successfully');
      } catch (error) {
        console.error('Error updating password:', error);
        if (error.code === 'auth/wrong-password') {
          throw new Error('Current password is incorrect');
        }
        throw new Error('Failed to update password');
      } finally {
        setLoading(false);
      }
    }
  );

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyReport: true,
    weeklyReport: true,
    criticalAlerts: true
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    deviceHistory: true,
    sessionTimeout: 30
  });

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteUser(auth.currentUser);
      // Redirect to login page or show success message
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        setReAuthDialogOpen(true);
      } else {
        alert('Failed to delete account');
      }
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={profileForm.values.photoURL}
                    alt={profileForm.values.displayName}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  />
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    type="file"
                    onChange={(e) => {
                      // Handle photo upload
                      const file = e.target.files[0];
                      if (file) {
                        // Upload to storage and get URL
                        // Then update photoURL
                      }
                    }}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Change Photo
                    </Button>
                  </label>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <form onSubmit={profileForm.handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    name="displayName"
                    value={profileForm.values.displayName}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={!!profileForm.errors.displayName && profileForm.touched.displayName}
                    helperText={profileForm.touched.displayName && profileForm.errors.displayName}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profileForm.values.email}
                    disabled
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={profileForm.values.phoneNumber}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={!!profileForm.errors.phoneNumber && profileForm.touched.phoneNumber}
                    helperText={profileForm.touched.phoneNumber && profileForm.errors.phoneNumber}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Stack>
              </form>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <form onSubmit={passwordForm.handleSubmit}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.values.currentPassword}
                        onChange={passwordForm.handleChange}
                        onBlur={passwordForm.handleBlur}
                        error={!!passwordForm.errors.currentPassword && passwordForm.touched.currentPassword}
                        helperText={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                              >
                                {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.values.newPassword}
                        onChange={passwordForm.handleChange}
                        onBlur={passwordForm.handleBlur}
                        error={!!passwordForm.errors.newPassword && passwordForm.touched.newPassword}
                        helperText={passwordForm.touched.newPassword && passwordForm.errors.newPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.values.confirmPassword}
                        onChange={passwordForm.handleChange}
                        onBlur={passwordForm.handleBlur}
                        error={!!passwordForm.errors.confirmPassword && passwordForm.touched.confirmPassword}
                        helperText={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<LockIcon />}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Update Password'}
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary="Add an extra layer of security to your account"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={securitySettings.twoFactorAuth}
                          onChange={(e) => setSecuritySettings(prev => ({
                            ...prev,
                            twoFactorAuth: e.target.checked
                          }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Login Alerts"
                        secondary="Get notified of new sign-ins to your account"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={securitySettings.loginAlerts}
                          onChange={(e) => setSecuritySettings(prev => ({
                            ...prev,
                            loginAlerts: e.target.checked
                          }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Device History"
                        secondary="Track devices that have accessed your account"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={securitySettings.deviceHistory}
                          onChange={(e) => setSecuritySettings(prev => ({
                            ...prev,
                            deviceHistory: e.target.checked
                          }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive updates via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        emailNotifications: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive updates via SMS"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        smsNotifications: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        pushNotifications: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider sx={{ my: 2 }} />
                <ListItem>
                  <ListItemText
                    primary="Daily Report"
                    secondary="Receive daily activity summary"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.dailyReport}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        dailyReport: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Weekly Report"
                    secondary="Receive weekly activity summary"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.weeklyReport}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        weeklyReport: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Critical Alerts"
                    secondary="Receive alerts for critical events"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.criticalAlerts}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        criticalAlerts: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-authentication Dialog */}
      <Dialog
        open={reAuthDialogOpen}
        onClose={() => setReAuthDialogOpen(false)}
      >
        <DialogTitle>Confirm Password</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please enter your password to continue.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReAuthDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              // Handle re-authentication
              setReAuthDialogOpen(false);
              handleDeleteAccount();
            }}
            color="primary"
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Setup; 