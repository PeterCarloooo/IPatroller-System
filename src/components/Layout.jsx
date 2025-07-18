import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  ControlCamera as CommandCenterIcon,
  Assessment as ReportIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const drawerWidth = 280;

const Layout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication on mount and location change
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate, location]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setIsDrawerCollapsed(!isDrawerCollapsed);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'IPatroller', icon: <SecurityIcon />, path: '/ipatroller' },
    { text: 'Command Center', icon: <CommandCenterIcon />, path: '/command-center' },
    { text: 'Illegals', icon: <GavelIcon />, path: '/illegals' },
    { text: 'Report', icon: <ReportIcon />, path: '/report' },
    { text: 'Setup', icon: <SettingsIcon />, path: '/setup' },
  ];

  // If not authenticated, don't render the layout
  if (!user) {
    return null;
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          {!isDrawerCollapsed && (
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              IPatroller
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleDrawerCollapse}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: isDrawerCollapsed ? 40 : 48,
              height: isDrawerCollapsed ? 40 : 48,
              bgcolor: 'primary.main',
            }}
          >
            {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          {!isDrawerCollapsed && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role || 'User'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <Tooltip title={isDrawerCollapsed ? item.text : ''} placement="right">
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: location.pathname === item.path ? 'primary.light' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    minWidth: isDrawerCollapsed ? 'auto' : 48,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isDrawerCollapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.main',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: isDrawerCollapsed ? 'auto' : 48 }}>
              <LogoutIcon color="error" />
            </ListItemIcon>
            {!isDrawerCollapsed && <ListItemText primary="Logout" sx={{ color: 'error.main' }} />}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${isDrawerCollapsed ? 80 : drawerWidth}px)` },
          ml: { sm: isDrawerCollapsed ? 80 : drawerWidth },
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary' }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: isDrawerCollapsed ? 80 : drawerWidth },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isDrawerCollapsed ? 80 : drawerWidth,
              borderRight: 'none',
              boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
              transition: 'width 0.2s ease-in-out',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isDrawerCollapsed ? 80 : drawerWidth}px)` },
          transition: 'width 0.2s ease-in-out',
          mt: { xs: 8, sm: 9 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 