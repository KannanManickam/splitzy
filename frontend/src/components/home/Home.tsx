import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Paper,
  IconButton,
  Chip,
  Stack,
  Divider,
  Tooltip,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Payment as PaymentIcon,
  ReceiptLong as ReceiptIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { groupService } from '../../services/group';
import { expenseService } from '../../services/expense';
import { getFriendBalances } from '../../services/balance';
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

export default function Home() {
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
  const theme = useTheme();
  const { user: _ } = useAuth();

  const refreshDashboardData = async () => {
    try {
      setLoading(true);
      const [groups, expenses, balances] = await Promise.all([
        groupService.getGroups(),
        expenseService.getExpenses(),
        getFriendBalances()
      ]);
      
      // Calculate expenses total
      const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      // Calculate balance totals
      let amountOwed = 0;
      let amountOwing = 0;
      
      balances.forEach(balance => {
        if (balance.balance > 0) {
          // Positive balance means others owe you
          amountOwed += balance.balance;
        } else if (balance.balance < 0) {
          // Negative balance means you owe others
          amountOwing += Math.abs(balance.balance);
        }
      });
      
      setDashboardData({
        totalExpenses,
        totalGroups: groups.length,
        recentExpenses: expenses.slice(0, 5),
        groups: groups.slice(0, 3),
        totalBalance: Number((amountOwed - amountOwing).toFixed(2)),
        amountOwed: Number(amountOwed.toFixed(2)),
        amountOwing: Number(amountOwing.toFixed(2))
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboardData();
  }, []);

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

  if (loading) {
    return <LoadingState type="pulse" message="Loading dashboard data..." height="400px" />;
  }

  return (
    <Box sx={{ mt: -1, mx: -1 }}>
      {/* Compact Balance Stats Row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
                <Typography variant="body2" fontWeight={500}>Total Balance</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0 }}>
                {formatCurrency(dashboardData.totalBalance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  You're Owed
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {formatCurrency(dashboardData.amountOwed)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  You Owe
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600} color="error.main">
                {formatCurrency(dashboardData.amountOwing)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Suggestions - Collapsible, Borderless Card */}
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 2,
          mb: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Box sx={{ 
          p: 1.5, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: theme.palette.background.paper
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PaymentIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Suggested Settlements
            </Typography>
          </Stack>
        </Box>
        <Box>
          <PaymentSuggestions onSettlementSuccess={refreshDashboardData} />
        </Box>
      </Paper>

      {/* Content Grid - Tighter Spacing */}
      <Grid container spacing={2}>
        {/* Recent Groups - Fixed width, variable height */}
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <GroupIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Active Groups
                </Typography>
              </Stack>
              <Tooltip title="View all groups">
                <IconButton
                  size="small"
                  onClick={() => navigate('/groups')}
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              {dashboardData.groups.map((group, index) => (
                <Box key={group.id}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          width: 36,
                          height: 36,
                          mr: 1.5,
                          fontSize: '0.85rem',
                        }}
                      >
                        {group.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {group.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          {group.memberCount} members
                        </Typography>
                      </Box>
                      <Chip
                        label={formatCurrency(group.totalBalance)}
                        size="small"
                        color={group.totalBalance >= 0 ? "success" : "error"}
                        variant="outlined"
                        sx={{ minWidth: 80, fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  {index < dashboardData.groups.length - 1 && (
                    <Divider sx={{ mx: 2 }} />
                  )}
                </Box>
              ))}
              {dashboardData.groups.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No active groups
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Expenses - Fixed width, variable height */}
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ReceiptIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Recent Expenses
                </Typography>
              </Stack>
              <Tooltip title="View all expenses">
                <IconButton
                  size="small"
                  onClick={() => navigate('/expenses')}
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              {dashboardData.recentExpenses.map((expense, index) => (
                <Box key={expense.id}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'secondary.lighter',
                          color: 'secondary.main',
                          width: 36,
                          height: 36,
                          mr: 1.5,
                          fontSize: '0.85rem',
                        }}
                      >
                        {expense.paidBy.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {expense.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(expense.date)} · {expense.paidBy.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </Box>
                  </Box>
                  {index < dashboardData.recentExpenses.length - 1 && (
                    <Divider sx={{ mx: 2 }} />
                  )}
                </Box>
              ))}
              {dashboardData.recentExpenses.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent expenses
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}