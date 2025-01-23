import React from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Link,
  Toolbar,
  Typography,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const AdminLayout = ({ children, title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          zIndex: theme.zIndex.drawer + 1,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`
        }}
      >
        <Container maxWidth={false}>
          <Toolbar 
            disableGutters 
            sx={{ 
              minHeight: 64,
              px: 2
            }}
          >
            {showBack && (
              <IconButton
                edge="start"
                onClick={() => navigate(-1)}
                sx={{ color: theme.palette.primary.main }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            
            {title && (
              <Typography 
                variant="h6" 
                component="h1" 
                sx={{ 
                  fontWeight: 500,
                  color: theme.palette.text.primary
                }}
              >
                {title}
              </Typography>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <IconButton 
              onClick={handleLogout}
              sx={{ 
                color: theme.palette.grey[700],
                '&:hover': {
                  backgroundColor: theme.palette.error.lighter,
                  color: theme.palette.error.main
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.grey[50],
            borderRight: `1px solid ${theme.palette.divider}`
          },
        }}
      >
        <Toolbar>
          <Link
            component={RouterLink}
            to="/admin"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                color: theme.palette.primary.main
              }
            }}
          >
            <DashboardIcon />
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Form Admin
            </Typography>
          </Link>
        </Toolbar>
        <Divider />
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: theme.palette.grey[50],
          marginTop: '64px'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;