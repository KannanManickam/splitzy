import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Grid,
  Divider,
  Avatar,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { groupService } from '../../services/group';
import { expenseService } from '../../services/expense';
import LoadingState from '../LoadingState';
import PaymentSuggestions from './PaymentSuggestions';

interface DashboardData {
  totalExpenses: number;
  totalGroups: number;
  recentExpenses: any[];
  groups: any[];
  totalBalance: number;
  amountOwed: number;
  amountOwing: number;
}

const drawerWidth = 240;

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalExpenses: 0,
    totalGroups: 0,
    recentExpenses: [],
    groups: [],
    totalBalance: 0,
    amountOwed: 0,
    amountOwing: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [groups, expenses] = await Promise.all([
        groupService.getGroups(),
        expenseService.getExpenses()
      ]);

      // Calculate various totals
      const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      // Amount owed to you (expenses you paid for)
      const amountOwed = expenses
        .filter(exp => exp.paidBy.id === user?.id)
        .reduce((sum, exp) => {
          // Subtract your own share
          const yourShare = exp.amount / exp.splitBetween.length;
          return sum + (exp.amount - yourShare);
        }, 0);

      // Amount you owe to others
      const amountOwing = expenses
        .filter(exp => exp.paidBy.id !== user?.id && exp.splitBetween.some(u => u.id === user?.id))
        .reduce((sum, exp) => {
          // Only add your share of the expense
          const yourShare = exp.amount / exp.splitBetween.length;
          return sum + yourShare;
        }, 0);

      setDashboardData({
        totalExpenses,
        totalGroups: groups.length,
        recentExpenses: expenses.slice(0, 5),
        groups: groups.slice(0, 3),
        totalBalance: Number((amountOwed - amountOwing).toFixed(2)),
        amountOwed: Number(amountOwed.toFixed(2)),
        amountOwing: Number(amountOwing.toFixed(2)),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Groups', icon: <GroupIcon />, path: '/groups' },
    { text: 'Expenses', icon: <ReceiptIcon />, path: '/expenses' },
    { text: 'Friends', icon: <GroupIcon />, path: '/friends' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.dark',
                width: 35,
                height: 35,
                fontSize: '1rem'
              }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
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
              width: drawerWidth,
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
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {loading ? (
          <LoadingState type="pulse" message="Loading dashboard data..." height="500px" />
        ) : (
          <>
            {/* Hero Section with Total Balance */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                py: { xs: 4, md: 6 },
                px: 3,
                mb: 4,
              }}
            >
              <Box sx={{ maxWidth: "xl", marginLeft: 0, px: 2 }}>
                <Grid container spacing={4} alignItems="flex-start">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                      {formatCurrency(dashboardData.totalBalance)}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                      Total Balance
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Box
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          p: 2,
                          borderRadius: 2,
                          flex: 1,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          You are owed
                        </Typography>
                        <Typography variant="h5" fontWeight={600}>
                          {formatCurrency(dashboardData.amountOwed)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          p: 2,
                          borderRadius: 2,
                          flex: 1,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          You owe
                        </Typography>
                        <Typography variant="h5" fontWeight={600}>
                          {formatCurrency(dashboardData.amountOwing)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <Box sx={{ maxWidth: "xl", marginLeft: 0, px: 3, mb: 6 }}>
              {/* Payment Suggestions Section */}
              <PaymentSuggestions />
              
              <Grid container spacing={4} justifyContent="flex-start" alignItems="flex-start">
                {/* Active Groups Section */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    <Box
                      sx={{
                        px: 3,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        Active Groups
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => navigate('/groups')}
                        sx={{
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Box>
                    <List sx={{ p: 0 }}>
                      {dashboardData.groups.map((group) => (
                        <ListItem
                          key={group.id}
                          sx={{
                            px: 3,
                            py: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            width: '100%',
                            pr: 20 // Make space for secondary action
                          }}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                width: 44,
                                height: 44,
                                mr: 2
                              }}
                            >
                              <GroupIcon />
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography 
                                variant="subtitle1" 
                                fontWeight={600}
                                sx={{ 
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {group.name}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {group.memberCount} members
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 24,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            <Typography
                              color="primary.main"
                              fontWeight={600}
                              sx={{
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatCurrency(group.totalBalance)}
                            </Typography>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/groups?id=${group.id}`)}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                    {dashboardData.totalGroups > 3 && (
                      <Box
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderTop: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate('/groups')}
                        >
                          View all {dashboardData.totalGroups} groups
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Recent Expenses Section */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    <Box
                      sx={{
                        px: 3,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        Recent Expenses
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => navigate('/expenses')}
                        sx={{
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Box>
                    <List sx={{ p: 0 }}>
                      {dashboardData.recentExpenses.map((expense) => (
                        <ListItem
                          key={expense.id}
                          sx={{
                            px: 3,
                            py: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            width: '100%',
                            pr: 16 // Make space for the amount
                          }}>
                            <Avatar
                              sx={{
                                bgcolor: 'secondary.main',
                                width: 44,
                                height: 44,
                                mr: 2
                              }}
                            >
                              {expense.paidBy.name[0]}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography 
                                variant="subtitle1" 
                                fontWeight={600}
                                sx={{ 
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {expense.description}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {formatDate(expense.date)} • {expense.paidBy.name}
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 24,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Typography 
                              color="primary.main" 
                              fontWeight={600}
                              sx={{
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatCurrency(expense.amount)}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                    <Box
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/expenses')}
                      >
                        View all expenses
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}