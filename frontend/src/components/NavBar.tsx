import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Home as HomeIcon,
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
  Groups as GroupsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Receipt as ReceiptIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // For user menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // For mobile drawer menu
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };
  
  const navItems = [
    { name: 'Home', path: '/home', icon: <HomeIcon /> },
    { name: 'Friends', path: '/friends', icon: <PeopleIcon /> },
    { name: 'Groups', path: '/groups', icon: <GroupsIcon /> },
    { name: 'Expenses', path: '/expenses', icon: <ReceiptIcon /> },
    { name: 'Settlements', path: '/settlements', icon: <WalletIcon /> }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderDrawerContent = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div">
          Expense Sharing
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/profile')}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        {isAuthenticated && isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component={Link} 
          to={isAuthenticated ? '/home' : '/'}
          sx={{ 
            flexGrow: 1,
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 700,
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          Expense Sharing
        </Typography>
        
        {isAuthenticated && !isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                color={isActive(item.path) ? 'primary' : 'inherit'}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{ 
                  fontWeight: isActive(item.path) ? 700 : 400,
                  bgcolor: isActive(item.path) ? 'action.hover' : 'transparent'
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        )}
        
        {!isAuthenticated ? (
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/register')}
              sx={{ mr: 1 }}
            >
              Register
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        ) : (
          <Box>
            <IconButton
              onClick={handleUserMenuClick}
              sx={{ ml: 2 }}
              aria-controls={open ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0) || '?'}
              </Avatar>
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'user-button',
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => {
                handleClose();
                navigate('/profile');
              }}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
        
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          {renderDrawerContent()}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}