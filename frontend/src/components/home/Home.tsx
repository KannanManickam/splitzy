import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
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
  const { user: _ } = useAuth(); // Keep the hook call but ignore the value

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
    return <LoadingState type="pulse" message="Loading dashboard data..." height="500px" />;
  }

  return (
    <>
      {/* Hero Section with Total Balance */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4F6BFF 0%, #7C4DFF 100%)',
          color: 'white',
          mt: -3, // Compensate for the main content padding
          mx: -3,
          pt: { xs: 6, md: 8 },
          pb: { xs: 8, md: 10 },
          px: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
          }
        }}
      >
        <Box sx={{ maxWidth: "xl", marginLeft: 0 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              mb: 1,
              fontWeight: 500
            }}
          >
            Total Balance
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {formatCurrency(dashboardData.totalBalance)}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  p: 2,
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  You are owed
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {formatCurrency(dashboardData.amountOwed)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  p: 2,
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  You owe
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {formatCurrency(dashboardData.amountOwing)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box sx={{ mt: -4, px: 3, pb: 6 }}>
        <Box sx={{ maxWidth: "xl", marginLeft: 0 }}>
          {/* Payment Suggestions Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              mb: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <PaymentSuggestions onSettlementSuccess={refreshDashboardData} />
          </Paper>

          <Grid container spacing={4}>
            {/* Active Groups Section */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>

                <Box>
                  {dashboardData.groups.map((group) => (
                    <Box
                      key={group.id}
                      sx={{
                        px: 3,
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateX(8px)'
                        }
                      }}
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 44,
                            height: 44,
                            mr: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          <GroupIcon />
                        </Avatar>
                        <Box sx={{ flex: 1, mr: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {group.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {group.memberCount} members
                          </Typography>
                        </Box>
                        <Typography
                          color="primary.main"
                          fontWeight={600}
                        >
                          {formatCurrency(group.totalBalance)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Recent Expenses Section */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>

                <Box>
                  {dashboardData.recentExpenses.map((expense) => (
                    <Box
                      key={expense.id}
                      sx={{
                        px: 3,
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateX(8px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar
                          sx={{
                            bgcolor: 'secondary.main',
                            width: 44,
                            height: 44,
                            mr: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {expense.paidBy.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, mr: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {expense.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(expense.date)} • {expense.paidBy.name}
                          </Typography>
                        </Box>
                        <Typography
                          color="primary.main"
                          fontWeight={600}
                        >
                          {formatCurrency(expense.amount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}